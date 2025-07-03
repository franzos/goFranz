---
title: "Vibe Coding with Rust: The Key To Success. Not."
summary: "It works until it doesn't. My experience with AI agents and coding."
layout: blog
source:
date: 2025-6-26 0:00:00 +0000
category:
  - Tools
tags:
  - development
  - claude
  - llms
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

In my professional career I occasionally had the opportunity to manage small teams. I've always found it quite satisfying being able to set a goal, initiate research and discussion on how to achieve these goals, and then seeing the team deliver on it.

With the AI agents looming, I felt a similar thrill; I could set a goal, and have a discussion with Claude or Gemini about how to achieve said goal, and then see the agents deliver on it. 

## Planning: Excitement

> A "challenge me on this" usually delivers seeminly thoughtful questions that highlight points I've missed.

In part, this actually works really well - discussing with Claude about infrastructure and potential pitfalls is quite effective; A "challenge me on this" usually delivers seeminly thoughtful questions that highlight points I've missed.

My usual flow would look like this:

1. Come up with an initial plan
2. Ask the LLM to review and challenge it
3. Address the feedback and iterate until I'm reasonably satisfied
4. Ask the LLM to break it up into milestones, and create a detailed TODO list

## Execution: Churn

At this point, it's really tempting to just hand this over to the LLM, and let it churn on it; I've done this a few times now, and usually the results are getting more "mixed", the longer I left it run. It seems it always comes back to the primary problem of context: In any more complex codebase, where you're not just dealing with little snippets or very focused changes, the LLMs tend to lose track of previously written code or don't understand how features are connected.

### Bloat and Deceit

In one example, I wanted to expand a billing library to include subscriptions along with pay as you go options; Claude proposed a reasonable plan, and started churning on it. It wrote tests too, giving me confidence that things were working as expected. When it announced that the library is now good beyond imagination and I started reviewing the changes:

- It added 2x more Stripe webhook endpoints
- Didn't complete some of the subscription logic and instead left "TODO" comments
- Tests that ultimately failed were made to work by bypassing checks

I've also tried to keep a closer eye on what it's doing, reviewing milestones and giving feedback on what I don't agree on, but this sometimes gets the LLM confused, so more often than not, I put it aside and make the changes myself.

There's ways to manage this somewhat: [Recommendations for Claude Code](h/blog/claude-code-vs-claude-api/#recommendations)

## Review: Disappointment

_This graph is oversimplified, but it illustrates the point._

<div class="mermaid">
graph TB
    subgraph Initial Stage
        A1[Agent 1] --- A2[Agent 2]
        A2[Agent 2] --- A3[Agent 3]
        A1[Agent 1] -->|80% accuracy| C1[Change 1]
        A2[Agent 2] -->|75% accuracy| C2[Change 2]
        A3[Agent 3] -->|70% accuracy| C3[Change 3]
    end

    C1 --> C2 --> C3

    subgraph Review Stage
        A4[Human Review] -->|Oh my ...| C4[Trash]
    end

    C3 --> A4
</div>


For my own needs, I really don't quite get the excitement about AI agents just yet; The longer I let them run, the more the issues compound, and the more time I have to spend to undo them. I have yet to find a sweet spot working with AI because sometimes it delivers great results, and other times it just fails completely.

I've previously written about where I use LLMs quite successfully:
- [Claude Sonnet 4 on the Frontend with Guardrails](/blog/claude-sonnet-4-on-the-frontend-with-guardrails/)
- [Using LLMs to Accelerate Non-Critical Work](/blog/using-llm-to-accelerate-non-critical-work/)

## Tomorrow, Maybe.

I'm not really sure whether to be excited about AI agents or not. Auto-complete is nice, and speeding up some mundane tasks too, but I'm always left feeling that something is not quite right. One day I may get too comfortable, and things will go astray without noticing, because the LLM is too agreeable, and doesn't really know what's what.