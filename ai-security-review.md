---
title: "AI Security Review"
layout: page
description: "Human-led, AI-aided security review for AI features. Prompt injection, RAG leaks, agent abuse, PII exposure — with a report your engineers can act on."
keywords: "AI security review, LLM security audit, prompt injection testing, RAG security, AI red team Europe, AI penetration testing Lisbon"
permalink: /ai-security-review/
---

Your AI feature passes the linters. Your infra passes the scans. Your pentester cleared the endpoints. And the chatbot still leaked another customer's support ticket to a user who asked nicely.

Traditional security review doesn't catch this. Automated AI agents flag a hundred things without context — you get a pile of findings, no fix plan, and no human to ask. Meanwhile the actual exploit sits in the three-line gap between your RAG retrieval and your output filter.

I do AI-specific security review. Human-led, AI-aided where it helps. Scoped to your stack. Report your engineering team can actually act on.

## What gets tested

**Prompt injection** — direct (user input), indirect (documents, emails, web content the model ingests), and chained (one prompt feeds the next).

**Data exfiltration via RAG** — can a user trick the retrieval layer into surfacing another tenant's documents? Does the model leak metadata it shouldn't?

**Output filtering bypasses** — if you have a safety or content filter, can it be defeated with encoding tricks, role play, or language switching?

**Authorization gaps in AI endpoints** — the model often runs with elevated permissions. Can a user coerce it into acting with more authority than they have?

**Agent abuse** — if the AI can call tools, can it be manipulated into calling the wrong ones, or the right ones too many times (cost-blow-up, rate-limit attacks)?

**PII in model outputs and logs** — does the model emit data from fine-tuning or training that it shouldn't? Are traces quietly logging PII the product claims it doesn't collect?

**Supply chain** — what third-party weights, embeddings, prompt templates, or agents are in your stack? What's their provenance? What happens if they change under you?

## How it works

- **Kickoff call** to scope the feature, data flows, and threat model
- **1–3 weeks of hands-on testing** — manual attacks aided by tooling, not replaced by it
- **Written report** — findings, severity, repro steps, and concrete remediation per issue
- **30-minute debrief** with your team — no "here's 40 PDFs, good luck"
- **30-day retest** on critical findings, at no extra cost

## Where I come from

A decade of work in spaces where trust matters — authentication platforms (OIDC/CIBA), digital identity ([TWIN/IOTA](https://www.twin.org/)), compliant crypto exchanges, medical data systems. I build AI features myself — which is why I know where they break.

If you'd rather I build the thing instead of review it, see [AI That Fits Your Stack](/ai-build/).

## Investment

### Feature review — €8–12k
Single AI feature — chatbot, agent, RAG pipeline, generation endpoint, or similar. Fixed scope, 2–3 weeks. Findings report, debrief, and 30-day retest included.

### Platform review — €18–25k
Multiple AI features across a product, with threat modeling. Fixed scope, 3–5 weeks.

### Retainer — €2–4k/mo
Ongoing review as features ship. Monthly scope, rolling.

Day rate available on request for narrow scopes or emergency work.

Payment via Stripe, Bitcoin, USDT, DAI, or IBAN (wire transfer).

## One caveat

This is AI security review, not general penetration testing. If you need SOC 2 / ISO 27001-style engagements with OSCP or CREST credentials on the quote, you want a dedicated pentest firm. Happy to point you to one. (On what "ISO 27001 aligned" actually means versus certified, see [this post](/blog/iso-27001-42001-what-aligned-actually-means/).)

If the thing you're actually worried about is in your AI layer — prompt injection, RAG leaks, agent abuse, model supply chain — [drop me a line](/contact/) or reach out on [WhatsApp](https://wa.me/351920739996?text=Hi%20Franz,%20I%27d%20like%20an%20AI%20security%20review).

Either way — happy to tell you honestly whether I'm the right person for it.
