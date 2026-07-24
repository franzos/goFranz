---
title: "AI is the race car. I'm the driver."
description: "I use AI all day and I'm more productive than ever. But it still goes astray the moment nobody's watching. Here's what it can't do, and why that's the job."
layout: blog
source:
date: 2026-07-22 0:00:00 +0000
category:
  - Tools
tags:
  - llms
  - development
  - ai
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

A client asked me recently why they'd pay me, when they could point an AI at the problem themselves. It's a fair question, and I didn't take it the wrong way. I use AI all day. If it could do the whole job on its own, I'd be the first to say so, and go find something else to do.

The thing is, it can't. Not yet, and not for anything where a wrong answer has consequences. So let me tell you what AI actually does for me, where it falls over, and what that leaves to me.

## The race car

I'm not an AI skeptic. I run multiple agents, on different problems, with my own system holding it all together: how tasks get scoped, how context gets fed in, how output gets checked before I trust it. On a good day I'm more productive than I've ever been in my career.

So this isn't a "computers bad" piece. The machine is fast. Faster than me, at a lot of things. That's exactly why it's worth being clear about what it doesn't do.

## Where it goes astray

Left alone, it drifts. I've had an agent [announce a job was done](/blog/vibe-coding/) when it had quietly stubbed out the hard parts and made the failing tests pass by skipping the checks. I've cleaned up [enough AI-built apps](/blog/lovable-dev-apps-need-professional-help/), hardcoded keys and bypassable auth and all, to know that a prototype and a product are different animals.

The specific mistakes are almost beside the point. A lot of them are dumb, and they get fixed fast: next model, next release, gone. What doesn't change is the shape of the thing. It's confident, it's eager to please, and it doesn't know what it doesn't know. On a straight road it flies. It just can't tell when the road stops being straight, and it'll drive into the wall and report a clean lap.

## What that leaves to me

Once you accept that, the actual job gets clear. It's the parts the machine can't do:

- **Keeping it on course.** Somebody has to notice when the plausible answer is the wrong one, and pull it back before it compounds.
- **Weighing trade-offs under real constraints.** Not the abstract version, the real one: this device, this battery budget, these users, this deadline, this regulator. I've had to make a smartwatch stream vitals over BLE and WebRTC without killing the battery, and keep [thirty-something services up for two years without configuration drift](/resume/). The model has no stake in any of that.
- **Knowing how a product is actually used.** Not how the spec says it's used. How people actually use it, in the field, in a hurry, in a language and a context I had to go and learn.
- **Seeing the second-order consequences.** If we do this now, what does it cost us in a year? Which shortcut becomes a load-bearing wall?
- **Figuring out what's important in the first place.** The whole game, really. The model can answer almost any question you pose. It can't tell you which question matters.

That last part is where experience actually lives. I've spent the better part of my working life hands-on: with real people, real hardware, real problems, across a lot of countries and cultures. You don't get that from a context window. You get it from being on the hook when it goes wrong.

## The driver

So here's how I think about it. AI is the race car. It's quick, it's powerful, and on the straight it'll leave me behind. But it doesn't know which race it's in, when to brake, or whether the finish line is even in the right place. That's the driver's job, and the driver is me.

Maybe that changes. Maybe one day the car drives itself well enough that the seat's empty but we're a long way from there for anything where being wrong is expensive.

Until then, I'll keep the car fast and I'll keep my hands on the wheel. All of this is driven by me. That's not a limitation. That's the whole point.
