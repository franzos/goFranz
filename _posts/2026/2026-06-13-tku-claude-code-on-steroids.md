---
title: "TKU: Claude Code on Steroids"
description: "A single Rust binary that tracks token usage and cost across every AI coding tool, and lets me swap between my work and personal Claude subscriptions with one command."
layout: blog
source:
date: 2026-6-13 0:00:00 +0000
category:
  - Tools
tags:
  - tku
  - rust
  - claude-code
  - cli
  - tooling
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I run Claude Code all day. Company subscription for work, my own subscription for the side projects and the tinkering. Two problems came out of that pretty quickly: I had no real sense of what I was actually burning, and switching between the two accounts meant fiddling with credential files by hand. So I built [TKU](https://github.com/franzos/tku), a small Rust CLI that answers both.

It reads the session files Claude Code already writes to disk, fetches live pricing, and shows you aggregated reports. No proxy, no wrapper around the tool, nothing to sign up for. Point it at a machine that runs Claude Code and it just works. It'll also read Codex, Gemini CLI, Amp, OpenCode, and a handful of others if you use them, but Claude Code is what I built it for.

## The numbers I actually wanted

The default `tku` gives you today's usage. From there it fans out:

```bash
tku            # daily usage
tku monthly    # monthly aggregation
tku model      # per-model breakdown
tku session    # per-session
tku plot 1w    # inline bar chart of the last week
```

You get token counts split the way they actually bill (input, output, cache write, cache read), per-model cost, and breakdowns by project and tool. The cache-read line alone is worth seeing: it's usually the bulk of the tokens and almost none of the cost, and once you've looked at it a few times you stop worrying about context size the way you used to.

Two commands go a bit further than "what did I spend":

- **`tku sub`** pulls your Claude Max/Pro utilization straight from Anthropic's OAuth API, so you see how much of the plan you've actually used this cycle, not just dollar-equivalents. With `--plan` it compares your usage against upgrading or downgrading and tells you which plan you should be on. For me that turned a vague "am I getting my money's worth" into a straight answer.
- **`tku model-burn`** measures intensity rather than totals: tokens per minute, cost per active hour, cost per calendar day, with idle-time clamping so a lunch break doesn't skew the rate. It's the difference between "I spent X this week" and "this is how hard I lean on the tool when I'm actually working."

There's also a `watch` command that live-updates as the session files change (inotify on Linux, FSEvents on macOS), and a `bar` command that emits JSON for waybar, i3bar, or polybar with warn/critical thresholds. I keep the running cost in my status bar now, which is either healthy or a bad idea depending on your temperament.

## Switching work and personal accounts

This is the part I use most. Claude Code stores its login in `~/.claude/.credentials.json` and stashes account details in `~/.claude.json`. Swapping between two subscriptions means swapping both, and doing it by hand is exactly the kind of fiddly, easy-to-get-wrong thing you don't want in the middle of your day.

TKU's accounts subsystem handles it:

```bash
tku account            # list saved accounts
tku account swap work  # switch to the work subscription
tku account swap personal
```

Each account keeps its own credentials, but shared settings (your skills, your `CLAUDE.md`) stay put across the swap, so your setup doesn't change just because the login did. The first time you run it, your current login gets registered as `default` automatically, so you're not starting from an empty slate. There are safeguards in place: it won't clobber an unsaved login, and it won't let you delete the account you're currently on.

The nice payoff is attribution. Every swap is timestamped, so reports can be filtered to a single account's windows:

```bash
tku monthly --account work
```

Now "what did the company subscription cost this month" and "what did I spend on my own stuff" are two different questions with two different answers, instead of one blurry total.

## Running it

It's a single binary, available via Homebrew, `.deb`, `.rpm`, Guix, or Cargo. The [install section on GitHub](https://github.com/franzos/tku#install) has the command for each.

Config is optional and lives in `~/.config/tku/config.toml` if you want it: pick your pricing source (litellm, openrouter, or llmprices) and your currency (any ISO 4217 code, mine's EUR).

```toml
pricing_source = "litellm"
currency = "EUR"
```

Cold start does a full scan and cache build (around 20 to 30 seconds depending on the backend), and every run after that is warm at roughly half a second. There are two cache backends if you care: bitcode by default, or SQLite if you'd rather.

## What it isn't

TKU reads what the tools write locally, so its numbers are as good as those session files, and pricing is a best-effort fetch, not an invoice. It's a dashboard for your own consumption, not accounting. But for knowing what I'm burning, whether I'm on the right plan, and keeping my two subscriptions cleanly separated, it's become part of how I run Claude Code every day.

It's [on GitHub](https://github.com/franzos/tku) under GPL-3.0. If you live in Claude Code the way I do, it's worth the two minutes to install.
