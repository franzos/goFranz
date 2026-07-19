---
title: "Liwan: a Lightweight Matomo Replacement"
description: "A privacy-first, self-hosted analytics tool that dropped in where my Matomo instance used to be. One Rust binary, no database to babysit, and I imported all the old data."
layout: blog
source:
date: 2026-6-20 0:00:00 +0000
category:
  - Tools
tags:
  - rust
  - analytics
  - self-hosted
  - privacy
  - matomo
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I ran Matomo for years. It does the job, but self-hosting it means a PHP app, a MariaDB instance, cron for the archiving, and the general upkeep that comes with all of that. For a handful of small sites where I just want to know what pages people read and where they came from, it was more moving parts than the question deserved.

So I went looking for something lighter, and found [Liwan](https://liwan.dev) by [explodingcamera](https://github.com/explodingcamera). It's privacy-first web analytics in a single Rust binary: no cookies, no cross-site tracking, no persistent identifiers, and the tracking snippet is one line under 1KB. I liked it enough that I forked it, added the couple of things I needed to actually migrate off Matomo, and it's been running in Matomo's place ever since. Huge thanks to explodingcamera for the original, none of this exists without that work.

## What it looks like

You get a clean dashboard per project: pageviews over time, referrers, top pages, countries, browsers, the usual breakdown, all updating in real time as visitors come in. Click to enlarge.

<figure style="margin:1.5rem 0">
  <a href="/assets/images/blog/liwan-dashboard.png"><img src="/assets/images/blog/liwan-dashboard.png" alt="Liwan dashboard with pageviews, referrers, and breakdowns" style="width:100%;border-radius:4px"></a>
  <figcaption style="font-size:.85em;opacity:.7;margin-top:.4rem">The project dashboard: traffic over time, plus referrers, pages, and geo breakdowns you can filter by. Screenshot from the <a href="https://github.com/explodingcamera/liwan">upstream Liwan project</a> by <a href="https://github.com/explodingcamera">explodingcamera</a>.</figcaption>
</figure>

## Why it replaced Matomo

The thing that sold me is what it doesn't need. Liwan is one self-contained binary. It does use databases (DuckDB for the analytics data, SQLite for the app state), but both are embedded and bundled into the binary, so there's no separate server to stand up, no cache layer, no archiving cron to get wrong. You can run it on a cheap VPS, an old Mac mini, or a Raspberry Pi, and it stays out of the way. It's written in Rust on tokio, so it's fast and it sips resources.

On privacy it's stricter than most out of the box. No cookies and no persistent identifiers means no consent banner to bolt on, and the data lives on your server, not someone else's. Bots and crawlers get filtered by default, so the numbers are closer to real people than what a lot of tools show you.

None of that would matter if I couldn't bring my history along, which is the part I built.

## The bits I added

My fork sits on top of upstream and adds the few things I needed for a real migration:

- **Matomo import.** `liwan import matomo` pulls your historical pageviews across, month by month, so you don't start from an empty dashboard. It's incremental and safe to re-run: a per-site watermark tracks how far it got, and a crash replays cleanly instead of duplicating rows. You map each Matomo site to a Liwan entity explicitly, it retries on rate limits, and there's a `--drop-local-urls` flag to skip the `localhost` noise from local development. I imported everything from my old instance in one pass.
- **OIDC single sign-on.** Password login still works, but with an `[oidc]` section set you get a "Sign in with SSO" button and accounts provision automatically on first login. It matches users on the provider's subject, so an email or name change never breaks the link, and there are options to restrict who can register.
- **A couple of extra dimensions.** Custom events as a first-class thing you can scope reports by, and an entity dimension to break a project down per tracked site.

The Matomo import and OIDC are the two that made this a drop-in rather than a fresh start.

## Not just for Matomo

If you're coming from Google Analytics, the pitch is the same, only more so. You swap a third-party script that phones home for a one-line snippet pointing at your own server, and the analytics stop being someone else's product. Liwan doesn't try to be a marketing suite; it answers "who visited, what did they read, where did they come from" and stops there. For most sites, that's the whole question.

It won't replace Matomo for everyone. If you lean on goals, funnels, e-commerce tracking, or Matomo's heavier reporting, those aren't here, and that's fine: run the real thing. For the common case of wanting private, low-maintenance numbers, Liwan is the trade I wanted.

## How it stacks up

This isn't a feature-count contest, and if it were, Liwan would lose it. Matomo, GA, Plausible, and the rest all do far more. The point is that for a lot of sites you don't need most of it, and the features that actually matter to me are "can I self-host it, does it respect visitors, and how much is there to run." On those, the picture flips:

| Tool | Self-host | What you run | Cookieless | Open source | Cost |
|------|-----------|--------------|------------|-------------|------|
| **Liwan** | Yes | Single binary (embedded DuckDB + SQLite) | Yes | Yes (Apache-2.0) | Free |
| GoatCounter | Yes (or free hosted) | Single Go binary (SQLite or PostgreSQL) | Yes | Yes (EUPL-1.2) | Free |
| Umami | Yes (or cloud) | Node app + PostgreSQL/MySQL | Yes | Yes (MIT) | Free self-host / paid cloud |
| Plausible | Yes (CE) or cloud | Elixir app + PostgreSQL + ClickHouse | Yes | Yes (AGPL-3.0) | Free self-host / paid cloud |
| Matomo | Yes or cloud | PHP + MySQL/MariaDB | Optional (configurable) | Yes (GPL-3.0) | Free self-host / paid cloud |
| Google Analytics | No | Nothing, it's their servers | No (cookies + consent) | No | "Free" (you're the product) |

The lightweight, self-host-friendly end is more crowded than it used to be, which is a good thing. What pulled me to Liwan specifically was three things: it's written in Rust, it has proper multi-site support, and the dashboard is genuinely nice to look at. That combination is rarer than you'd think.

## Running it

It's a single binary (or a Docker image). It reads one TOML config, looks for `./liwan.config.toml` or `~/.config/liwan/config.toml`, and any value can be overridden with a `LIWAN_*` environment variable, which is how you keep secrets out of the file. Point your reverse proxy at it, drop the snippet on your pages, and you're collecting.

The full setup, the OIDC configuration, and the Matomo import walkthrough live in the [README](https://github.com/franzos/liwan), so I don't have to keep two copies in sync.

## Where to get it

Upstream is at [liwan.dev](https://liwan.dev) and [github.com/explodingcamera/liwan](https://github.com/explodingcamera/liwan). My fork, with the Matomo import and OIDC, is at [github.com/franzos/liwan](https://github.com/franzos/liwan). There's a live demo on [demo.liwan.dev](https://demo.liwan.dev/p/liwan.dev) if you want to click around before installing anything.

That's the shape I was after: a tool that answers the analytics question, keeps the data on my server, and is boring to run. One binary, one config file, my history carried over, and no database server to keep alive.
