---
title: "tku: Run Claude as Another Account, Just Once"
description: "A one-shot exec that runs Claude Code under a different subscription without touching your active login, so your work session keeps going while you fire off one thing as your personal account."
layout: blog
source:
date: 2026-7-8 0:00:00 +0000
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

A while back I wrote about [tku](/blog/tku-claude-code-on-steroids/), my little Rust CLI for tracking token usage and swapping between my work and personal Claude subscriptions. The swap part (`tku account use work`) does a global switch: it rewrites your login and everything from then on runs as that account. Good for changing context for a while, but overkill when you just want to run one thing as the other account and keep going.

That's the gap `tku account exec` fills.

## One session, one account, no global switch

Say I'm deep in a work session and I want to run a single Claude Code session on my personal subscription, maybe to keep the side-project tokens off the company plan. I don't want to log out, swap, do the thing, and swap back. I just want:

```bash
tku account exec personal -- claude
```

That runs `claude` as `personal` in an isolated config dir, leaving your active `~/.claude` untouched. Your current work session (and any other `claude` you have open) keeps running exactly as it was. When the exec session exits, nothing about your global login has changed.

Like `sudo` or `env`, it runs whatever you put after `--`. It doesn't launch `claude` for you, so a one-shot prompt works the same way:

```bash
tku account exec personal -- claude -p "summarise this repo"
```

Or drop into a shell with the right `CLAUDE_CONFIG_DIR` already set, and run your own launcher from there:

```bash
tku account exec personal -- bash -i
```

## What it does under the hood

It seeds a private dir from the account's stashed credentials, then symlinks your shared `skills/`, `plugins/`, `agents/`, `commands/`, and `CLAUDE.md` so the session behaves like your normal setup, just with a different login. It copies and patches `.claude.json` and `settings.json`, and syncs any refreshed credentials back to the stash on exit. The dir lives under `$XDG_RUNTIME_DIR` (tmpfs, cleared on logout), never in your persistent config.

A few flags if you want to shape that: `--ephemeral` for a throwaway dir deleted on exit, `--clean` for a bare instance with none of the shared skills/plugins, and `--copy` to copy the shared dirs instead of symlinking them.

## The honest caveats

- Token usage inside an `exec` session is written to the isolated dir, so it does not show up in `tku` reports. That's the trade for isolation.
- It refuses to run if the account is already live, whether as your active login or another `exec`. Claude's OAuth refresh tokens are single-use, so two live sessions on one login invalidate each other and brick both. To run two of the same account at once, add a second login with fresh credentials as a separate stash entry.
- Credentials have to be file-based (`~/.claude/.credentials.json`), so this is Linux, not macOS, where Claude keeps them in the Keychain that `CLAUDE_CONFIG_DIR` doesn't relocate.

It turns out this is the account command I reach for most now. The global swap is for changing gears; `exec` is for the quick detour without leaving the road you're on.

It's [on GitHub](https://github.com/franzos/tku). If you juggle more than one Claude subscription the way I do, it's a nice one to have.
