---
title: "podman-healthcheckd: Container Healthchecks Without systemd"
description: "A small Rust daemon that runs Podman's container healthchecks on systems that don't have systemd to schedule them, like Guix, Alpine, or Void."
layout: blog
source:
date: 2026-4-25 0:00:00 +0000
category:
  - Tools
tags:
  - rust
  - podman
  - guix
  - containers
  - cli
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

Podman leans on systemd to run container healthchecks. When you define a `HEALTHCHECK` on an image, Podman installs a per-container systemd timer that fires `podman healthcheck run` on a schedule. That works fine on a systemd box. On a system without it, Guix in my case, but also Alpine or Void, the timer never gets created and the healthcheck simply never runs. Your container can go unhealthy and nothing notices, because the thing that was supposed to notice was never scheduled.

[podman-healthcheckd](https://github.com/franzos/podman-healthcheckd) is a small Rust daemon that puts that scheduler back.

## What it does

It's deliberately just a clock. On startup it enumerates running containers, inspects each for a healthcheck config, and spawns an async timer for every container that has one. Then it watches `podman events` for start, stop, and remove events and adjusts its timers as containers come and go. On SIGINT/SIGTERM it cancels everything and exits cleanly.

When a timer fires, it runs `podman healthcheck run` and gets out of the way. All the actual logic (retries, failing streaks, the on-failure action you configured on the container) lives inside Podman itself. The daemon doesn't second-guess any of it; it just makes sure the check gets called at the right interval, which is exactly the part systemd was doing for you.

That keeps the whole thing tiny and means it behaves identically to a systemd-scheduled setup. Nothing about how you define healthchecks changes.

## Where it applies

Any Linux box running Podman without systemd. That's the whole audience. If you're on a systemd distro, Podman already handles this and you don't need it. If you're on Guix, Alpine, Void, or anything else running Podman under a different init, this is the missing piece.

## Setting it up

It's a single binary. You can install it with Cargo, grab a prebuilt `.deb`/`.rpm` from the [releases](https://github.com/franzos/podman-healthcheckd/releases), and then just run it under whatever supervisor you use. Log verbosity is controlled by `RUST_LOG`:

```bash
RUST_LOG=info podman-healthcheckd
```

On Guix I ship it through my [Panther channel](https://github.com/franzos/panther) as a Shepherd home service, so it starts with my session and restarts if it dies:

```scheme
(use-modules (px services containers))

;; Default: runs at RUST_LOG=info
(service home-podman-healthcheckd-service-type)

;; Or bump the log level
(service home-podman-healthcheckd-service-type
         (home-podman-healthcheckd-configuration
          (log-level "debug")))
```

Add that to your home services, reconfigure, and the usual Shepherd verbs apply:

```bash
herd start podman-healthcheckd
herd status podman-healthcheckd
herd stop podman-healthcheckd
```

That's the whole thing. There's no config file and nothing to wire up per container: it reads the healthcheck definitions Podman already knows about and schedules them. If you run Podman off systemd and have ever wondered why your `HEALTHCHECK` lines seemed to do nothing, this is why, and this is the fix.

It's [on GitHub](https://github.com/franzos/podman-healthcheckd).
