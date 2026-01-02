---
title: "Jail Claude Code with Guix Shell Containers"
summary: "How to run Claude Code in an isolated container on Guix, protecting your system from unintended changes."
layout: blog
source:
date: 2026-01-02 0:00:00 +0000
category:
  - Tools
tags:
  - guix
  - claude
  - security
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

In a [previous post](/dev/isolate-claude-code-for-rust-development-with-docker/), I covered running Claude Code in Docker containers. But on Guix, there's a simpler approach: `guix shell --container`.

## Why Isolate?

Claude Code has broad file system access by default. While useful, it can easily go sideways. Containers limit the blast radius.

## The Command

```bash
guix shell --container \
  --expose=$HOME/.gitconfig=$HOME/.gitconfig \
  --share=$HOME/.claude=$HOME/.claude \
  --share=$HOME/.claude.json=$HOME/.claude.json \
  --share=$HOME/.config/claude=$HOME/.config/claude \
  --share=$HOME/.cache/pnpm=$HOME/.cache/pnpm \
  --share=$HOME/.local/share/pnpm=$HOME/.local/share/pnpm \
  --expose=$XDG_RUNTIME_DIR=$XDG_RUNTIME_DIR \
  --preserve='^DBUS_SESSION_BUS_ADDRESS' \
  --preserve='^COLORTERM' \
  --share=$PWD=$PWD \
  --network \
  coreutils bash grep sed gawk git node pnpm gh dunst \
  -- pnpm dlx @anthropic-ai/claude-code --dangerously-skip-permissions
```

## What Each Flag Does

**Container Basics**
- `--container`: Creates an isolated environment with its own filesystem view
- `--network`: Enables network access (required for API calls)
- `--share=$PWD=$PWD`: Gives Claude read/write access to your current project directory

**Claude Configuration (Required)**
- `--share=$HOME/.claude`: Claude's persistent configuration
- `--share=$HOME/.claude.json`: Claude's settings file
- `--share=$HOME/.config/claude`: Additional Claude config

**Git Access**
- `--expose=$HOME/.gitconfig`: Read-only access to git config (for commits, author info)

**Optional: Avoid Re-downloading Claude**
- `--share=$HOME/.cache/pnpm`: Shares pnpm cache
- `--share=$HOME/.local/share/pnpm`: Shares pnpm store

Without these, `pnpm dlx` downloads Claude Code fresh each time.

**Optional: Desktop Notifications**
- `--expose=$XDG_RUNTIME_DIR`: Exposes the runtime directory
- `--preserve='^DBUS_SESSION_BUS_ADDRESS'`: Preserves D-Bus for notifications
- `dunst` in packages: Notification daemon

These let Claude trigger desktop notifications when tasks complete.

**Terminal Colors**
- `--preserve='^COLORTERM'`: Maintains color support in the container

## The Result

Claude Code runs with full access to your project directory but nothing else. It can't touch your home directory, other projects, or system files. If something goes wrong, the damage stays contained.

## Guix Home Alias

Add an alias to your `home-bash-service-type` configuration:

```scheme
(service home-bash-service-type
  (home-bash-configuration
    (aliases
      '(("ccj" . "guix shell --container --expose=$HOME/.gitconfig=$HOME/.gitconfig --share=$HOME/.claude=$HOME/.claude --share=$HOME/.claude.json=$HOME/.claude.json --share=$HOME/.config/claude=$HOME/.config/claude --share=$HOME/.cache/pnpm=$HOME/.cache/pnpm --share=$HOME/.local/share/pnpm=$HOME/.local/share/pnpm --expose=$XDG_RUNTIME_DIR=$XDG_RUNTIME_DIR --preserve='^DBUS_SESSION_BUS_ADDRESS$' --preserve='^COLORTERM$' --share=$PWD=$PWD --network coreutils bash grep sed gawk git node pnpm gh dunst -- pnpm dlx @anthropic-ai/claude-code --dangerously-skip-permissions")))))
```

Reconfigure with `guix home reconfigure`, then run `ccj` from any project directory.
