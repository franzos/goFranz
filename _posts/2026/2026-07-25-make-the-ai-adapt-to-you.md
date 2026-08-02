---
title: "Make the AI adapt to you"
description: "Three things that made Claude fit how I actually work: an audit of my own transcripts, one central brain for plans and standards, and expert agents that arrive with the right references already loaded."
layout: blog
source:
date: 2026-07-24 0:00:00 +0000
category:
  - Tools
tags:
  - claude-code
  - ai
  - llms
  - tooling
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

A few people asked what I meant by "my own system" around the AI - how tasks get scoped, how context gets fed in, how output gets checked. It's three things, and none of them are clever. An audit loop, a central brain, and expert agents.

The common thread: the model isn't going to learn you. You have to write down what it should have learned, and put it where it'll get read.

## Let it audit your own sessions

I've been correcting the same things over and over. Small enough to type again, often enough that it adds up. So I pointed Claude at my own transcripts and asked what I keep saying. Here's what I asked:

```
Audit my past sessions in ~/.claude/ to find behavioural patterns worth encoding.

There are thousands of transcripts and gigabytes of them - filter for my turns
first, fan out subagents per project, and return summaries, not transcript dumps.

Find:
1. Questions you asked me where my answer was predictable.
2. Things I ask for repeatedly.
3. Things you did that I didn't ask for, and how I corrected you. Say whether my
   request was ambiguous, or you assumed.

Rules:
- 3+ occurrences with a quote, or it goes under "weak signals".
- Check ~/.claude/CLAUDE.md and existing skills first. Already covered and
  working: drop it, unless you can sharpen the wording - then propose the edit.
  Covered but I still corrected you: report it - the rule is too weak or buried,
  and that's the most useful finding.
- Propose each fix as exactly one of: a CLAUDE.md rule (give the wording), a
  skill (name + trigger), a settings.json hook, or nothing. Prefer sharpening an
  existing rule over adding a new one. No proposal longer than what it replaces.
- Report only. Don't create or edit skills, hooks, or CLAUDE.md. I'll pick.
```

The filter does the work. 2.7 GB across 5,332 transcript files; keeping only my turns cuts it to 1.2 MB, about 4,200 messages. That's small enough to actually read. Pairing each of my turns with the tail of the assistant message right before it roughly triples that, and it's worth it - a correction only makes sense next to whatever caused it. Then ten subagents, one per project batch.

What came back:

- Half of all assistant turns that got a reply ended in a permission question. 1,678 of them. A sixth of my answers were a bare "go ahead" under six words. There was already a rule against this.
- I wrote "don't commit" into 56 prompts across ten projects. Also already a rule. I clearly didn't trust it, and I was right not to: a subagent committed against an instruction it had been given directly.
- Around 70 times I asked for two or three agents to review and challenge a plan before building it. That one genuinely wasn't encoded anywhere.
- One menu got offered 73 times. I picked the same option 73 times.

Six of the top twelve findings were things my instructions already covered. I assumed the fix was better wording. Turns out it mostly wasn't: in four of those six, the rule held fine in the main loop and fell apart in subagents - `CLAUDE.md` doesn't reliably reach a dispatched agent, and hooks do. The other structural finding: my two most-violated rules were the two that contradict each other ("just do the obvious next step" versus "never do anything side-effecting unless I ask"). Nobody was going to win that, so both lost.

Nine edits to `CLAUDE.md`, one pre-tool hook on git writes, three new skills. Every replacement came out shorter than what it replaced, which was a rule I set in the prompt and would set again. Instruction files fail by accumulation.

## Give it one place to remember

Plans, specs, test guides, standards. By default they scatter across repos, or nobody writes them down at all. I keep them in one git repo, `~/git/brain`, outside the projects they describe:

```
brain/
  CLAUDE.md                    # what this is, and the conventions
  projects/
    forseti/
      CLAUDE.md                # the file that repo's root would carry
      plans/2026-07-19-org-scoped-oauth-entry.md
      specs/2026-07-19-org-scoped-oauth-entry-design.md
      tests/oidc-external-provider.md
  notes/
    oauth-oidc-standard.md     # cross-project house style
```

Plans and specs are dated, `YYYY-MM-DD-<slug>.md`, and a plan shares its slug with its spec so they pair. Test guides aren't dated - they're living documents, one per distinct setup. A project with one way to test needs one guide; Forseti has five, because running the automated suite and driving an external OIDC provider are not the same job.

The repo is inert on its own. What makes it work is the routing rule in `~/.claude/CLAUDE.md`, which every session reads:

```markdown
## Knowledge Base (brain)

- **Plans and specs**: all project plans and specs are written to, and looked up
  from, this repo, never the project's own `docs/`. They go under
  `~/git/brain/projects/<project-name>/plans/` and `.../specs/`.
- **Tests**: how a project is tested lives under
  `~/git/brain/projects/<project-name>/tests/`, never the repo.
- **Notes**: `~/git/brain/notes/` holds cross-project best practices and
  standards. Look here before implementing a new feature and follow a relevant
  note if one exists.
```

That last line is the one that pays. `notes/oauth-oidc-standard.md` says which crate my Rust clients use for OIDC, which of my three projects to copy for which shape, and which claims Forseti puts in the ID token. Any agent adding login to a new project starts there instead of inventing a fourth pattern.

Bootstrapping it is a job you can hand over. I did it per project, one at a time:

```
Read this repo end to end and write ~/git/brain/projects/<name>/CLAUDE.md.

Cover: what this is in two sentences, the commands I actually run (check the
Makefile/justfile, not the docs), the architecture decisions someone would get
wrong on their first day, and the traps - exclusive feature flags, generated
files, anything that fails confusingly.

Verify every command by running it. Skip anything git log already tells me.
No history, no changelog.
```

The "verify every command by running it" line matters more than it looks. Without it you get a plausible `make test` that doesn't exist.

## Hand it an expert, not a generalist

This one's the cheapest win. A subagent is just a system prompt plus a toolset, and a good one is mostly a curated set of references - the things a generalist half-remembers, written down correctly.

Mine live in [claude-plugins](https://github.com/franzos/claude-plugins). Here's the useful part of the OID4VC specialist, verbatim:

```markdown
- **Cite the spec.** Every non-trivial claim points to a section:
  `OID4VP 1.0 §5.9.3`, `OID4VCI 1.0 §7.2`, `RFC 9901 §4`. If you don't know the
  section, look it up; don't guess.
- **Use Final specs, not stale drafts.** OID4VCI 1.0 (Final, 2025-09-16),
  OID4VP 1.0 (Final, 2025-07-09) supersede all earlier ID-13/ID-14 numbering.
- **Know what was renamed.** SDKs lag the specs; you will see legacy naming:
  - `vc+sd-jwt` → **`dc+sd-jwt`** (media type + `typ`)
  - `presentation_definition` (DIF PE) → **`dcql_query`** in OID4VP 1.0 Final
```

That's about 2,100 words for the whole agent. It isn't teaching the model verifiable credentials - it already knows the concepts. It pins down what changed after the training cutoff and where the internet is full of confidently wrong blog posts. Ask a generalist for an SD-JWT VC format identifier and you'll get `vc+sd-jwt` as often as not, because that's what most of the corpus says.

The same trick works on your own stack. My `forseti:link` skill knows where each of my apps keeps its OIDC client config, and how to recreate one against a local Hydra when it's gone stale - none of that is in any model's training data.

Skills are the verb version of this - a checklist the model follows when a specific job comes up. `rust:commit` runs the format-and-scoped-test gate and writes a commit subject matched to `git log`. `release-check` verifies the README and docs still match the code and the tag format is right, and explicitly does *not* tag or push.

## What I'd watch out for

Fair caveat on the audit: five weeks and one person, so none of my numbers transfer. The method might.

Rank findings by frequency rather than by how annoyed you sounded - the loudest correction in my corpus was a one-session outlier, while the expensive one was quiet and showed up in every batch. And check whether a failing rule is failing in *delegated* work before you rewrite the words.

My git hook fires on staging too, so it'll nag more than it needs to. I'll find out shortly whether that's worse than the problem.
