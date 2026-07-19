---
title: "claude-plugins: Domain Experts You Can Install"
description: "A small Claude Code marketplace of subagents grouped into installable plugins, from stack-specific engineers to single-domain specialists, plus the one setup step that makes them behave."
layout: blog
source:
date: 2026-7-10 0:00:00 +0000
category:
  - Tools
tags:
  - claude-code
  - plugins
  - subagents
  - tooling
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I've been accumulating Claude Code subagents for a while: a Rust engineer that actually writes idiomatic Rust, a security auditor that maps the attack surface first, a Guix specialist that knows what a G-expression is. They lived in my dotfiles and nowhere else, which is a fine place for them until you want to share them or install a subset on a fresh machine. So I packaged them up as [claude-plugins](https://github.com/franzos/claude-plugins), a small marketplace you can add to Claude Code and pull from piecemeal.

The idea is simple: domain experts (subagents) grouped into installable plugins. Each plugin ships one or more agents you dispatch for a specific stack or domain. Nothing exotic, just a way to hand Claude the right specialist instead of hoping the generalist gets it right.

## Installing

Add the marketplace, then install only the plugins you want:

```
/plugin marketplace add franzos/claude-plugins
/plugin install engineers
/plugin install identity
```

Plugins are namespaced by their marketplace (this one is called `gofranz`). If another marketplace you've added also ships a plugin named `engineers`, qualify it to disambiguate:

```
/plugin install engineers@gofranz
```

And if you'd rather hack on the agents yourself, point the marketplace at a local checkout instead of the remote:

```
/plugin marketplace add /path/to/claude-plugins
```

## What's in the box

There are a handful of plugins, split by how I use them. The `engineers` plugin is the daily driver: stack-specific implementation agents for C++, Go, Java, Next.js, Qt, React, Rust, and TypeScript. The rest are specialists that go deep in one thing rather than shallow across many, `identity`, `guix`, `security`, `sql`, `iota`, and `iced`. And `forseti` and `stackpit` are operator skills for two of my own projects, so those only matter if you run them.

The [README](https://github.com/franzos/claude-plugins) has the full list and what each agent covers.

## The one setup step worth doing

These agents run build, test, and format commands, so they need to know something about your machine. Left alone they'll probe for what's available and ask when unsure, which works but costs a round trip every session. Better to tell them once, in your global `~/.claude/CLAUDE.md`: Claude reads it every session and the facts reach the agents. A short `## Environment` block (OS and shell, container runtime, package manager, how you provide toolchains, and "never install system-wide packages without asking") is enough. The README has an example to copy.

## Best practice: compose, don't copy

If you build your own skills on top of these, wire them to the agents that already exist instead of re-deriving what those agents know. Delegate to the matching agent rather than inlining its expertise, reference an agent by name instead of duplicating its instructions, and keep each agent focused while your skills chain them together. The payoff is the usual DRY one: fix a shared agent once and everything that references it improves. The README goes into this properly.

It's [on GitHub](https://github.com/franzos/claude-plugins). If any of those stacks are yours, install the one plugin you care about and see whether the specialist beats the generalist. In my experience it usually does, which is the whole reason these exist.
