---
title: "Still at it: PantherX, four years on"
description: "Four years after some wrong turns dragged PantherX out longer than it should have, it's found a shape that works: a layer on top of Guix that makes it approachable, with a GUI installer, GUI package management, real SSO for Linux, and a more stable substitute server."
layout: blog
source:
date: 2026-7-5 1:00:00 +0000
category:
  - Linux
  - Tools
tags:
  - guix
  - pantherx
  - linux
  - self-hosted
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

Four years ago I wrote a post called [All at once: I made a huge mistake](/blog/all-at-once-i-made-a-huge-mistake/). The short version: we set out to build a whole distribution from scratch, tried to do too much ourselves, and I eventually admitted that the best path was to stop reinventing the wheel and lean on [Guix](https://guix.gnu.org/) instead. Move the whole system into one repository, apply changes with inheritance, revert a bad release in half a second. That part still resonates.

What I didn't have a good answer for back then was the gap between "Guix is the right foundation" and "a normal person, or a company, can actually run this." Guix is excellent on the command line and fairly unforgiving off it. So the last stretch has been less about grand vision and more about filling that gap, piece by piece. PantherX was always a layer on top of Guix; what's changed is that we've stopped trying to build everything ourselves and started **picking the high-value pieces** instead: the parts that improve the day-to-day experience for an end user, make Guix more approachable, and make it more attractive for enterprise. The same Guix underneath, with the rough edges sanded down.

Here's where things stand.

## A GUI installer

Installing an OS from a text prompt isn't for everyone. The keyboard-only TTY installer worked, but it was a wall for anyone who didn't already live in a terminal. So there's now a [graphical installer](https://github.com/franzos/guix-install) that walks you through the same phases (locale, timezone, disk, encryption, users, desktop) in a window, streams the build output with a progress bar, and keeps the resume-on-failure and atomic-write behaviour from the original. It installs plain Guix, Nonguix, or PantherX. Same install, just driven from a window.

There's also a fourth mode I care about for the enterprise angle: point it at a config server with `--config <id>` and it fetches a predefined system definition (a `system.scm`, optionally a `channels.scm` and a `config.json`) as a tarball over HTTPS and installs that verbatim. The interview collapses to just disk and encryption; everything else (packages, services, users, desktop) comes from the central config. So a shop can define one machine, host it, and stamp out a fleet of identical ones by ID. That's the central-repository argument from the old post, applied at install time. The [latest ISO](https://wiki.pantherx.org/) ships both the GUI and the TTY installer, so you can pick. ([write-up](https://www.pantherx.org/news/2026/guix-install-gets-a-gui.html))

<figure style="margin:1.5rem 0">
  <a href="/assets/images/blog/guix-install-gui.png"><img src="/assets/images/blog/guix-install-gui.png" alt="The guix-install GUI mid-install" style="width:100%;border-radius:4px"></a>
  <figcaption style="font-size:.85em;opacity:.7;margin-top:.4rem">The installer mid-run: phases tick off down the sidebar, with live build output and a progress bar. Click to enlarge.</figcaption>
</figure>

## GUI package and channel management

The other half of the daily-driver problem is what happens after install. `guix search`, `guix install`, `guix upgrade` and channel edits aren't where most people want to spend their day. There's now a [graphical package manager](https://github.com/franzos/guix-rs) for browsing and searching packages, installing and removing them, running `guix pull` and reconfigure (via polkit, only for the privileged bits), and managing channels with backup and restore. It ships in seven languages and follows your locale. Anything against your own profile runs unprivileged. ([write-up](https://www.pantherx.org/news/2026/a-gui-for-everyday-guix.html))

<figure style="margin:1.5rem 0">
  <a href="/assets/images/blog/guix-gui-package-manager.png"><img src="/assets/images/blog/guix-gui-package-manager.png" alt="The Guix GUI package manager home screen" style="width:100%;border-radius:4px"></a>
  <figcaption style="font-size:.85em;opacity:.7;margin-top:.4rem">The home screen: well-known apps grouped by category as a starting point, with search for the full catalogue. Click to enlarge.</figcaption>
</figure>

## SSO for Linux

This is the one I'm most pleased with, because it's the part that makes Guix interesting beyond a single machine. [Forseti](https://github.com/franzos/forseti) now backs Linux logins off a central identity store: NSS `passwd`/`group`, per-user SSH keys, interactive `ssh` and console login through the OAuth Device Authorization Grant, and an offline passphrase fallback for when the server's unreachable. The system PAM module ships via the [panther channel](https://github.com/franzos/panther). I wrote more about Forseti itself [here](/blog/forseti-the-web-ui-ory-doesnt-ship/); the point for this post is the fit. Centrally managed Linux with SSO isn't new ground, there are other options, but most are generic. Forseti is built with Guix in mind, so it slots into this setup more naturally than a generic IdP would, and pairs with the central-config install above.

## A more stable substitute server

Less glamorous, more load-bearing. The channel moved to [Codeberg](https://codeberg.org/gofranz/panther), and there's a new substitute server at `substitutes.guix.gofranz.com`: a small build farm on a ThinkPad in my office, fronted by a CDN and driven by Cuirass. It builds the Panther channel's own packages, so those come down prebuilt as substitutes instead of compiling on your machine. Authorize the key, point your substitutes at it, done (and on PantherX it's already wired in). ([write-up](https://www.pantherx.org/news/2026/codeberg-and-new-substitutes.html))

## A channel that's actually filling out

The [channel](https://codeberg.org/gofranz/panther) is north of 200 packages now, and a good chunk of them are the proprietary apps people actually reach for but that upstream Guix won't ship. Guix holds the free-software line, Panther carries the nonfree pieces, both in one place. A few of the fast-moving ones:

- **Editors and AI**: VS Code, Cursor, Zed; Claude Code, Claude Desktop, Codex, Ollama.
- **Desktop apps**: Zoom, Slack, Discord, RustDesk, Bitwig Studio, Tidal, Thorium, Ghostty.
- **Networking and VPNs**: Tailscale, Mullvad, Nebula, IVPN, ngrok.
- **Dev tooling**: gh, GitButler, jj, bun, pnpm, Biome, OpenTofu, DBeaver.

## Services, not just packages

Packaging an app is half the job; wiring it into the system is the other half. So the channel also ships a growing set of Guix services, the point being that you declare these in your `system.scm` (or per-user in `home.scm`) instead of hand-rolling shepherd scripts. On the server side:

- **Forseti**, with Ory Hydra and Kratos: the SSO stack from above, ready to reconfigure into place.
- **bichon**, a small mail archiver with full-text search and a web UI.
- networking daemons: Nebula overlay mesh, Tailscale, Mullvad, plus usbguard

And a handful of [Guix Home](https://guix.gnu.org/manual/en/html_node/Home-Configuration.html) services for the per-user side: foot terminal config, per-user mail archiving, unattended upgrades, and podman healthchecks. Same central-config story as the installer: describe the machine once, services and all, and reproduce it wherever you need it.

## Where this is going

Put together, the shape is clearer than it's ever been. PantherX isn't trying to be a better OS than Guix. It's the layer that makes Guix approachable: install it without a terminal, manage it without memorizing subcommands, and centrally configure a fleet of Linux machines with proper single sign-on, using one repository as the source of truth. Everyone benefits from a fix to one file, which was the whole argument in 2022. It just took building the accessible front for it to matter.

This is still ongoing, and plenty is rough or pre-release. But it no longer feels like I'm pushing a boulder uphill. It feels like the pieces are finally lining up. Do take that with a grain of salt, as always, and if any of it sounds useful, it's all at [pantherx.org](https://www.pantherx.org/).
