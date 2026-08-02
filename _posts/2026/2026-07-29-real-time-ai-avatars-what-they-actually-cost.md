---
title: "What Real-time AI avatars actually cost"
description: "Four real-time avatar APIs, with the credit systems unpacked into dollars per minute, the latency claims taken apart, and a look at where your session data actually goes."
layout: blog
source:
date: 2026-07-29 0:00:00 +0000
category:
  - Tools
tags:
  - ai
  - avatars
  - pricing
  - privacy
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

Someone asked me this week what it'd cost to put a talking face on a voice agent instead of a static waveform. I didn't know, so I sat down and worked it out. It took longer than it should have: not one of these vendors publishes a plain per-minute price. Three of them sell credits or split their product into two modes with different burn rates, and one of them quotes a different set of tier names and overage rates in its docs than on its own pricing page.

## What "real-time avatar" means here

A WebRTC video stream of a face that talks back to you, low-latency enough to hold an actual conversation, billed by the minute of live session time rather than by the rendered video. That's the category, and it comes down to a handful of companies.

HeyGen and LiveAvatar are the same company. HeyGen's classic product renders pre-recorded video from a script; that's the $29-$149/month Creator/Pro/Business plans you've probably seen. LiveAvatar is a separate product for the streaming case, with its own domain, its own docs, its own credits (the FAQ is explicit: "LiveAvatar credits are independent of HeyGen API credits"), and its own prices. Anam, out of London, and Tavus, out of San Francisco, are standalone companies doing the same thing. So is Beyond Presence, a GmbH out of Munich - newer, less known, and with its own quirks worth getting into.

## Pricing, with the math shown

Here's each vendor's cheapest and most expensive self-serve tier. "Blended" is just the monthly fee divided by the included minutes; "overage" is what the next minute costs once you're past that.

| Vendor | Entry plan | Included | Blended /min | Overage /min | Top self-serve | Included | Blended /min | Overage /min |
|---|---|---|---|---|---|---|---|---|
| LiveAvatar | $19 (Starter) | 150 credits | $0.13 Lite / $0.25 Full | $0.12 (see below) | $475 (Business) | 5,000 credits | $0.095 Lite / $0.19 Full | $0.10 Lite / $0.20 Full |
| Anam | $12 (Starter) | 50 min | $0.24 | $0.16 | $999 (Professional) | 5,000 min | $0.20 | $0.11 |
| Tavus | $59 (Starter) | 100 min | $0.59 | $0.37 | $397 (Growth) | 1,250 min | $0.32 | $0.32 |
| Beyond Presence | €49 (Starter) | 280 S2V / 140 Agent min | €0.175 S2V / €0.35 Agent | same | €349 (Scale) | 4,000 S2V / 2,000 Agent min | €0.087 S2V / €0.175 Agent | €0.0875 / €0.175 |

**LiveAvatar** has the widest internal spread, because it has two modes: Full bundles HeyGen's own LLM and TTS and burns 2 credits per minute; Lite is bring-your-own-LLM and burns 1. Same credit, half the minutes. A credit costs $0.127 on Starter, $0.099 on Essential and $0.095 on Business, so the Lite/Business corner - $0.095/min - is the cheapest of them, and Full mode on Starter, $0.25/min, is the most expensive thing LiveAvatar sells.

The overage is where it gets sloppy. The pricing page names the tiers Starter, Essential and Business; the docs name them Starter, Pro and Scale at the same three prices, and quote overage as "$0.12/min" for the first and "$0.10/credit" for the other two. Mixing units like that in a four-row table isn't a great sign. Taken at face value it also means overage on Business costs *more* per credit ($0.10) than the credits in the plan you already bought ($0.095) - the opposite of a volume discount, on the plan built for volume. It's a rounding error in practice. It's still the sort of thing that tells you how recently this pricing was assembled.

**Anam** is the only one whose blended cost isn't monotonically decreasing. It runs $0.24 (Starter) → $0.196 (Explorer, $49/250 min) → $0.15 (Growth, $299/2,000 min) → $0.20 (Professional, $999/5,000 min). Professional is worse per included minute than the tier below it. The overage rate does keep dropping the whole way ($0.16 → $0.14 → $0.12 → $0.11), so Professional pays off if you consistently run well past your allowance; if you don't, Growth is the cheaper seat. Two other things to fold into that: Anam bills by the second, and unused minutes don't roll over - 250 included and 50 used means 200 expire.

**Tavus** is priced for someone else. Its $0.37/min Starter overage is nearly triple LiveAvatar's Full-mode rate and more than double Anam's, and the entry plan is $59 before you've streamed anything. Where LiveAvatar and Anam are built to get a solo developer in for the price of lunch, Tavus's floor assumes a team with a budget. It also has the coarsest metering of the four: conversations round to the nearest 6 seconds with a 30-second minimum charge, which matters if your sessions are short.

**Beyond Presence** splits the same way LiveAvatar does - a cheaper Speech-to-Video mode where you bring your own conversational logic (50 credits/min), and a bundled Agent mode at exactly double (100 credits/min). What's different is that the included rate equals the overage rate at every single tier, because the included minutes are just the monthly fee divided by that rate: €49 buys 280 S2V minutes at €0.175, €349 buys 4,000 at €0.0875, and the next minute after that costs the same as the last one. No Anam-style trap where upgrading quietly makes your effective rate worse, and no LiveAvatar-style inversion where overage costs more than the plan. The price per minute is the price per minute, and it drops as the plan gets bigger. Predictable, which counts for something when you're building a cost model.

All four sell custom Enterprise tiers above these - unlimited avatars, white-labeling, custom concurrency, SLAs - with no public numbers. You talk to sales.

## Features

| | LiveAvatar (HeyGen) | Anam | Tavus | Beyond Presence |
|---|---|---|---|---|
| Stack | Full (bundled LLM+TTS, GPT-4o-mini) or Lite (BYO) | Bundled; custom voice clone on Professional+ | Bundled, four-model pipeline | Agent (bundled) or Speech-to-Video (BYO) |
| Rendering | HeyGen's avatar engine, 1080p on Business+ | Cara-4 (July 2026), 1152×768, ~150ms server-side generation claimed | Phoenix-4 render, Raven-1 perception, Sparrow-1 turn-taking, Hummingbird-0 glue; sub-600ms claimed | Genesis 2.0, 1080p, <100ms streaming inference and ≤250ms global avatar latency claimed |
| Custom avatar from | ~2 min of footage, self-serve | Photo upload or text prompt, <2 min to generate | Custom "replica" from footage | Email support with a training video; "available on demand for priority customers", not self-serve |
| Languages | No published count; depends on the ASR/TTS you wire up in Lite mode | 70+ | 42+ per the docs, set by your TTS layer | 34 language codes documented for managed agents |
| Integration | REST API, own SDKs, agent skills package | REST API, JS/Python SDKs, LiveKit, Pipecat, ElevenLabs Agents, Agora, VideoSDK | REST API, LiveKit plugin | REST API, LiveKit Agents, Pipecat, n8n node |
| Notable extra | Rides HeyGen's existing enterprise video infra | Watermark removal from Explorer up; zero data retention and regional residency on Enterprise | Ships its own consumer app (PALs) on the same stack | Claims 11k+ customers, 1,000+ parallel sessions, ≥99.5% uptime |

Take every latency number in that table with a large grain of salt, because they don't measure the same thing. Beyond Presence's "<100ms" is streaming inference; its "≤250ms" is global avatar latency; neither is the time from you stopping talking to the face starting. Anam's homepage advertises a 180ms average agent response time while its Cara-4 announcement reports ~150ms server-side avatar generation and sub-1-second median end-of-speech-to-first-response - three different boundaries. Tavus's sub-600ms is quoted both as end-to-end and as combined pipeline latency depending on which page you're reading, and the same figure was marketed for the previous Phoenix-3 generation.

The self-awarded trophies are worth a similar squint. Anam's site says Cara-4 "ranks #1 across all relevant metrics per Avatar Benchmark (2026)", next to a chart scoring Anam against Tavus, HeyGen and LemonSlice - and the page doesn't say who ran the benchmark or how. The 2025 edition of the same claim used a different competitor set and different metrics. Beyond Presence, meanwhile, calls Genesis 2.0 "the world's most advanced real-time AI avatar model" in a banner. Nobody in this category undersells itself, which is exactly why the pricing table above is worth more than any of the copy around it.

## Where your data goes

This is the part that varies company to company rather than plan to plan.

| | LiveAvatar (HeyGen) | Anam | Tavus | Beyond Presence |
|---|---|---|---|---|
| Headquartered | Los Angeles, US | London, UK (Anam.AI Ltd) | San Francisco, US | Munich, Germany (GmbH) |
| Session data storage | US, transferred internationally as needed | Not stated publicly; regional residency offered on Enterprise | US, explicitly - "necessarily accessed and processed in the U.S." | Not stated anywhere I could find |
| Trains models on your data? | Yes for non-Enterprise, unless you object; Enterprise excluded by default | Zero data retention available on Enterprise; silent otherwise | Yes, explicitly - "training our proprietary artificial intelligence technology" | Not addressed in the published privacy policy |
| Biometric data | Separate Biometric Information Privacy Notice; Art. 9(2)(a) consent taken separately from avatar creation, withdrawable | Not detailed publicly | Voiceprints and facial geometry, kept until purpose met or 1 year after your last interaction, whichever is first | Not addressed |
| Compliance claims | SOC 2 Type II, GDPR, CCPA, EU-US DPF, EU AI Act; EU-based DPO | SOC 2 Type II, HIPAA | SOC 2 Type 2 and HIPAA "on eligible plans"; GDPR reps named in the policy | GDPR, EU AI Act, SOC 2 Type II; DPO via heyData GmbH, Berlin |

Anam and Beyond Presence are the two actually headquartered in the EU/UK, which matters if data residency is a real constraint rather than a checkbox. Beyond Presence goes furthest on paper: a German GmbH, a German DPO, the strictest jurisdiction of the four. But its privacy policy is thinner than that suggests. It documents the company's own marketing stack in careful detail - HubSpot Germany, n8n, Lempire in Paris, Webflow and Cloudflare in San Francisco, Stripe Ireland, Google - and says nothing at all about the avatar session data: no storage location, no retention period, no training statement, no biometric clause. For a company selling "developed in Europe and fully GDPR compliant" as its main differentiator, that gap is the odd one.

HeyGen and Tavus are the least private and the most legible about it, which I'd rather have than the reverse. HeyGen says plainly that non-Enterprise input may train its models, exposes an objection route (privacy@heygen.com, not a settings toggle), keeps biometric consent separate from avatar-creation consent, and lets you create an avatar without agreeing to the training use. Worth reading the Terms next to that, though: the content license you grant is described as irrevocable and survives termination, which is a wider grant than "you can opt out" implies. Tavus is the most specific of anyone on biometrics - voiceprints and facial geometry, one year after last interaction - and the most unambiguous that everything happens in the US.

Anam sits in the middle: SOC 2 Type II and HIPAA, zero data retention and regional residency if you're on Enterprise, 30-day infrastructure logs. The ZDR page is worth reading closely, because it carves out the images used for one-shot persona creation and anything uploaded to a persona's knowledge base - those are retained regardless.

## Where this leaves you

None of these are drop-in replacements for each other once you look past "talking face."

LiveAvatar and Beyond Presence are the two cheapest ways in and the only two that let you skip the bundled LLM and TTS entirely, which is the setting most people building on top of an existing voice agent actually want. LiveAvatar has the lowest floor of anyone at $0.095/min; Beyond Presence has the more honest pricing curve, since its rate never gets worse as you scale and never surprises you at the overage boundary.

Anam has the cleanest published numbers of the dollar-priced options, the most languages, the widest integration surface, and a UK headquarters - with one real trap in the curve, where upgrading from Growth to Professional makes your effective rate worse unless you're genuinely running past your allowance.

Beyond Presence goes furthest into an actual EU jurisdiction and says the least about what happens to your session data once it's captured. Both of those are true at the same time.

Tavus costs the most per minute by a wide margin and meters the most coarsely. It's also the only one of the four building its own consumer product (PALs) on the same avatar stack it sells you, and it has the most differentiated pipeline: four named models, including one that does nothing but decide when you've stopped talking. Whether that's worth 3x is a question about your use case, not about the price list.
