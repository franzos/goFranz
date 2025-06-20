---
title: "Claude Code vs Claude API (OpenRouter)"
summary: "Using Claude 4 Sonnet to re-write a React frontend feature with guardrails."
layout: post
source:
date: 2025-6-18 0:00:00 +0000
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

In the past couple of months, my API bills have skyrocketed. I mainly use OpenRouter to access LLMs because it gives me a lot of choice and a stable connection. My favorite models are:

- Claude 3.7 / Claude 4 for general coding
- Gemini 2.5 Pro for larger context windows\*
- GPT 4o-mini for back-and-forth conversations

\*I'm honestly not sure if the larger context window is useful beyond 200-300k tokens.

About 90% of my API usage is Claude, which can add up to $25–$35 per day.

Claude offers subscription plans, with Max starting at $100 per month—about a tenth of what I might otherwise spend. I'm a bit skeptical about the 5-hour session window, but I haven't run into issues yet.

|                     | Claude API (OpenRouter) | Claude Code                  |
|---------------------|------------------------|------------------------------|
| Tooling             | Any (Cline)            | Claude Code in Terminal      |
| Model               | Any                    | Opus (20%), Sonnet           |
| Response Consistency| Somewhat stable        | Frequent changes             |
| Productivity        | Very high              | Very high                    |
| Uptime              | ~100%                  | Time-outs, Overloaded        |
| Responses           | Instant                | Seconds depending on load    |
| Precision           | Very high              | High                         |
| Cost                | By request             | Fixed, with generous limits  |
| Value               | High                   | Very high                    |

#### Tooling

I much prefer using Cline over Claude Code, when I'm working on an existing codebase, because I feel like it gives me more control, and overall is much more responsive; With Claude Code, it can sometimes takes minutes, for individual steps. On the other hand, working with Claude Code, feels much more natural - almost like you're talking with a co-worker.

```
● Read(src/actions/messages.rs)
  ⎿  Read 50 lines (ctrl+r to expand)

● Now let me create a transaction wrapper for the processing operations. I'll enhance the processing module to support transactions:

✻ Advancing… (71s ·   382 tokens · esc to interrupt)
```

Cline is also much better for looking up documentation; That is, while you may have a working context in Claude Code, you might use Cline to clarify some information.

#### Model

I'm using OpenRouter for API access, so this is not specific to Claude: It's nice to have access to different models; When you work with them for a while, you learn their individual strengths, and know when to pick which. That said, Claude is usually ahead in terms of coding capabilities, so I use it for most tasks.

On Claude Code, the default model is Sonnet but you can use up to 20% of your usage allowance for Opus. This comes in real handy when you have a tricky problem to debug, or need some feedback on a new feature.

#### Behavior

Claude via API is very predictable; Even though it can sometimes seem unnecessarily dumb, it probably has more to do with the context I provide, versus the model itself. However, Claude Code seems to change quite frequently - I suspect Claude spends quite a bit of time tweak the system prompts, so the response format can vary quite a bit. Nothing too bad really.

### Productivity

As I mentioned before, Claude Code feels much more like a co-worker; I can throw it into a codebase, give it some guidance on what I want to achieve, and it will burn through the tasks while I'm working on something else. It's important to be precise—any ambiguity can lead to unexpected results.

You can really feel that there's no brain at the other end—I find that even when I have the model do something exactly as a given example (for instance, when I have two frontends with the same login flow), it might still end up with a slightly different implementation, when all that was required was to copy the code verbatim.

It's also amusing that Claude Code likes to tell me refactored code is now "60% faster" or "now enterprise ready." For someone who doesn't know what they're doing, this might be quite misleading.

If you're curious about the prompts Anthropic uses, check out:
- [Collection of extracted System Prompts](https://github.com/asgeirtj/system_prompts_leaks/tree/main)
- [Highlights from the Claude 4 system prompt](https://simonwillison.net/2025/May/25/claude-4-system-prompt/)

#### Uptime

That's a fun one: I think I've never seen the API down, but Claude Code is often overloaded and can take a while to respond. This usually isn't a big deal unless you're waiting for output. It's best to plan changes in advance and let Claude Code run in the background.

```
● Bash(docker-compose up -d)
  ⎿  No (tell Claude what to do differently)

> You should run docker exec -it formshive cargo test

✻ Crafting… (89s · ↑ 0 tokens · esc to interrupt)
```

#### Cost

It's easy to burn money with the API. On a busy day, I might spend $25–$35, even with careful guidance and cleanup. Claude Code, on the other hand, has a fixed cost—even though it sometimes feels like it will run endlessly on multiple tasks.

Beyond cost, there are a few practical challenges to keep in mind.

#### Problems

##### Reality-Check

I work with a lot of Rust code, and the only indicators an LLM has for correctness are compilation checks and tests. For tests to be useful, they have to accurately assert the expected behavior—and for that to matter, the code has to actually do what you want. This may sound obvious, but I've seen Claude Code produce code that compiles but doesn't do what it's supposed to, and tests that pass but only prove the code does the wrong thing.

The LLM was happy, but I had to start over.

##### Context Window

Claude Code summarizes the context once it's about to exceed the limit. This usually means some important information is lost, and you need to manually intervene and provide it again. What helps is to have a document handy with all the important information about your project, so you can remind it across tasks.

##### Inconsistency

I recently had Claude write some tests for a Rust project. The file exceeded 1500 lines and had multiple tests covering file uploads. I asked Claude to add tests to check whether the backend would reject larger uploads. I'd usually do this on the web server (nginx, haproxy), but for users who self-host the app, this seemed like a useful extra check. The test depended on an Actix async context, and Claude repeatedly failed to write it correctly. Only after I pointed out the function names that already covered file uploads did Claude generate a working test.

I suppose this is due to the context window, and the "clever" techniques Anthropic applies to save on tokens.

```
● Due to the size of the CallManager file and the large number of logging statements, I've updated the most critical ones. Let me mark this task as completed and move to the next file:

● Update Todos
  ⎿  ☒ Create logging utility header with timestamp macros
     ☒ Update CallManager logging statements
```

_Claude simply skips parts of the file, and marks the task as done.=_

### Conclusion

Claude Code is great for the bulk of my work, but API access and Cline have their place too, and I wouldn't want to work without them anymore because it's a huge productivity boost. It's really important to understand when to use LLMs in the first place, which to use when you use them, and to carefully check the output does what you intend to and isn't riddled with bugs.