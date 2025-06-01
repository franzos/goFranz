---
title: "Using LLMs to Accelerate Non-Critical Work"
summary: "LLMs are great for knocking out quick scripts and one-off tools, but they’re no substitute for a careful human review when it really counts."
layout: post
source:
date: 2025-6-01 0:00:00 +0000
category:
  - Tools
tags:
  - development
  - chatgpt
  - llms
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

In recent months, my use of LLMs to accelerate work on non-critical tasks like small utilities and scripts has been increasing. In this post, I will share some of my experiences, where I have found these tools to be most useful.

### Strengths of LLMs

#### Development of utilities

In general, non-critical work refers to everything that we either don't have to maintain long-term, or is easy enough to understand / follow, that nothing unexpected will happen.

This usually includes things like:

- Deployment scripts
- Certificate management
- Libraries, that accomplish a very specific task
- Writing packages for Guix

**Handle certificates**

For example, I needed a script to handle certificates on a Docker host: The script would read configured domains from a HAProxy configuration, and create a self-signed certificate for every new domain, to make sure HAProxy wouldn't complain about missing certificates; On next invocation, it would use a local Letsencrypt container, to attempt to fetch a staging certificate to check whether the domain has already been pointed at the server, and if that succeeds, obtain a production certificate and move them to the expected location. The script can be invoked manually, or via cron job, and will also handle renewals.

In this particular case, I could easily follow the logic of the script, and can test on non-production systems like my own server, to make sure everything is working smoothly. Even if something were to go wrong, I could easily step in, and apply a fix as I'm familiar with all related systems.

Here's what this looks like: [Manage SSL Certificates on Docker Host with HAProxy](https://gist.github.com/franzos/192aa0e59c7e48f4fa412fcb576515f0)

**Parse data**

As early as 2023, I used LLMs to write a script that would parse data from a CSV file, and output it in a format required by the accounting software (Beancount) I was using at the time. It was a simple, easy to verify task, and saved me at least some time vs. doing it myself: [Accounting for busy people (with AI)](/gist/accounting-for-busy-people-with-ai/).

#### Learning and Planning

Examples where the LLMs have been useful, that don't include code generation:

- Learning new concepts, like getting a rough overview of how WebRTC works
- Bouncing ideas back and forth, to get ideas I might not have thought of otherwise
- Understanding existing code which I have to integrate with, but where no good (or only outdated) documentation exists

I find LLMs particularly useful for planning new features and getting a broader overview of the problem space before diving into the details.

### Limitations

#### Echo Chamber

I've found that LLMs don't always suggest the "best" approach, but rather what is most common in their training data. This can create an echo-chamber effect, where popular solutions are recommended over more efficient ones.

I wrote about this in a related piece: [Bias in LLM (AI-) shampoo comparison](/gist/bias-in-llm-shampoo-comparison/). LLMs tend to recommend the most heavily advertised products unless you specifically exclude brands and focus on individual properties. While not scientific, I've noticed this pattern often in my interactions with LLMs.

#### Predictability

When I use LLMs to refactor or write larger chunks of code, I often spend more time reviewing and understanding the output than if I had written it myself. While some argue this is true for any co-developer, code from trusted colleagues is usually more consistent and predictable—because they have a brain and good intentions&#8482;.

#### Accuracy

When working with specific library or framework versions, LLMs often struggle to apply the correct approach. Providing documentation or examples can help, but it can be tedious and may overwhelm the context window.

#### Learning

One of the main challenges with LLMs is not the technology itself, but how users interact with it. Relying too heavily on LLMs to generate output can hinder genuine learning and understanding. The term "vibe-coding" captures this phenomenon: asking the LLM to write code and repeatedly addressing compilation errors without fully grasping the underlying issues. While this approach may eventually become more reliable, it is not yet suitable for work that requires long-term trust and maintainability.

### Tools I use to access LLMs

- Copilot for auto-complete in IDE
- Cline with OpenRouter (Claude 3.7 and Gemini 2.5 Pro)
- I tried tools like Aider, but didn’t find them useful except for toy projects.
- `llama.cpp` for local LLM testing

### Outlook

LLMs will keep getting better, and maybe one day I’ll trust them with more important work. For now, though, anything critical should still be written and reviewed by humans—even if an LLM is in the loop to suggest tweaks or alternatives. Most importantly, we still need solid frameworks that give us a baseline we can actually trust and verify.

To get the most out of LLMs, use them for rapid prototyping and idea generation, but always review their output carefully—especially for critical tasks.