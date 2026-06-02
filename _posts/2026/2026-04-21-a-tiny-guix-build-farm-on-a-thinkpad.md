---
title: "A Tiny Guix Build Farm on a ThinkPad"
description: "Offloading Guix builds to a LAN ThinkPad, then serving the substitutes from a static file host."
layout: blog
source:
date: 2026-04-21 0:00:00 +0000
category:
  - Tools
tags:
  - guix
  - pantherx
  - infrastructure
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

[This post on ultrarare.space](https://ultrarare.space/en/posts/guix-build-farm/) inspired me to revise my [PantherX Channel](https://github.com/franzos/panther) build setup. I already had a dedicated box at Hetzner doing the job, but a ThinkPad X1 was sitting idle on my desk — so I moved builds to the ThinkPad and kept a small VPS just for serving files.

Here's the rough shape of it.

## The architecture

Two boxes:

- **ThinkPad X1 Carbon (i7-8565U, 16GB).** An old laptop I had sitting around. Runs [Cuirass](https://guix.gnu.org/manual/en/html_node/Continuous-Integration.html) and `guix-publish`. Builds packages, signs them, keeps them in a local cache.
- **A VPS running nginx in Docker.** Static file host. Doesn't know anything about Guix.

The ThinkPad builds, signs, and `rsync`s the cache to the VPS on a schedule. The VPS serves `.narinfo` and `.nar` files over HTTPS. Clients point their `--substitute-urls` at the VPS and get binaries instead of building from source.

The nice thing: If the ThinkPad dies, the last good cache keeps serving.

## The build side

Cuirass does the actual building:

```scheme
(service cuirass-service-type
         (cuirass-configuration
          (specifications %cuirass-specs)
          (host "0.0.0.0")
          (fallback? #t)))
(service guix-publish-service-type
         (guix-publish-configuration
          (host "127.0.0.1")
          (port 3000)
          (compression '(("zstd" 19)))
          (cache "/var/cache/publish")
          (ttl (* 90 24 3600))))
```

### The lazy-cache gotcha

`guix-publish` is lazy. It doesn't pre-generate `.narinfo` and `.nar` files for every store item — it waits for someone to ask. That's fine when clients hit it directly, but if you're `rsync`ing the cache to another host, you need the files to actually exist first.

The fix is a small warmup script that runs on cron. It walks the list of packages, asks `guix build --no-substitutes` for their store paths (which is instant if they're already built), and then fires an HTTP request at `localhost:3000/<hash>.narinfo` for each one. That's what triggers `guix-publish` to materialize the files on disk.

```scheme
(http-get (string-append "http://localhost:3000/"
                         hash ".narinfo"))
```

After the warmup, a second cron job runs `rsync` to push `/var/cache/publish/` to the VPS. Nothing fancy.

### First-time signing key

Before any of this works, generate the signing key on the build machine:

```bash
sudo guix archive --generate-key
```

The public key goes into the cache directory so clients can fetch it from `/signing-key.pub` later.

## The serving side

The VPS is about as minimal as it gets — nginx in Docker, a directory of static files, and four `location` blocks:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    autoindex off;

    location ~ \.narinfo$ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=3600";
    }

    location /nar/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=86400";
    }

    location = /signing-key.pub { try_files $uri =404; }
    location = /nix-cache-info  { try_files $uri =404; }

    location / { return 404; }
}
```

That's it. No PHP, no database, no Guix. `narinfo` files get a short cache (they're small and change often), `.nar` archives get a longer one (large and immutable once published).

HAProxy in front handles TLS and routes `substitutes.guix.gofranz.com` to the container.

## Using the substitutes

The substitutes live at **[https://substitutes.guix.gofranz.com](https://substitutes.guix.gofranz.com)** and cover the PantherX channel packages — stuff like `zed`, `claude-code`, `tidal-hifi`, `slack-desktop`, `mullvad-vpn-desktop`, `gh`, `broot`, and others.

To use them, authorize the signing key and add the URL to your substitute list. The public key:

```
(public-key
 (ecc
  (curve Ed25519)
  (q #0096373009D945F86C75DFE96FC2D21E2F82BA8264CB69180AA4F9D3C45BAA47#)
  )
 )
```

On a Guix System machine, that means adding the URL and key to your `guix-service-type` configuration. For an ad-hoc run:

```bash
guix archive --authorize < signing-key.pub
guix build <package> \
  --substitute-urls="https://substitutes.guix.gofranz.com https://ci.guix.gnu.org"
```

Keep the upstream Guix CI in the list — my server only covers the PantherX additions.

## Is the ThinkPad enough?

For PantherX packages specifically — yes. The i7-8565U isn't fast, but it doesn't need to be. Most of these packages are either pulling pre-built binaries (Electron apps, Rust releases) or compiling modest Rust/Go/Node codebases. A full rebuild of everything in the spec file finishes overnight, and incremental builds after a channel update are usually done in under an hour.

## Caveats

- **GC is conservative.** `guix gc --free-space=20G` weekly.
- **It's a laptop.** I set `handle-lid-switch 'ignore` in elogind so closing the lid doesn't kill the build.
- **The warmup script is a workaround.** There's probably a cleaner way to eagerly populate `guix-publish`'s cache, but I haven't found it yet. If you know one, I'd love to hear.
