---
title: "ISO 27001, ISO 42001, and What 'Aligned' Actually Means"
description: "A plain-English read on the two ISO standards that come up when customers ask about security and AI governance, and the honest difference between following them and being certified."
layout: blog
date: 2026-04-23 0:00:00 +0000
category:
  - Tools
tags:
  - iso27001
  - iso42001
  - compliance
  - ai-act
  - security
author: Franz Geffke
---

A client asked me recently if they were "ISO 27001 ready." What they meant was *"we have backups and MFA, are we good?"*, which is not what the question actually means, but it's a fair place to start. The gap between *"we follow sensible practices"* and *"an accredited auditor signed a certificate"* is where most of this conversation happens, and it's where a lot of the confusion lives too.

Since I'm now offering [AI integration](/work-with-me/#ai-that-fits-your-stack) and [AI security review](/work-with-me/#ai-security-review) work for EU teams, and both touch on this stuff constantly, here's a plain-English read on what ISO 27001 and ISO 42001 actually are, how they relate, whether you can skip one, and what it means to be "aligned" without paying for a certificate.

## What ISO 27001 actually is

ISO 27001 is an international standard for an **Information Security Management System**, an ISMS. It's worth stopping on that word *system*. ISO 27001 doesn't certify your encryption. It doesn't certify your product. It certifies the organisational machinery you use to identify, manage, and continually improve how you handle information security risk.

The structure has two halves:

- **Clauses 4–10**: the management system itself. Context, leadership, planning, support, operation, performance evaluation, improvement. Plan-Do-Check-Act, with paperwork.
- **Annex A**: a list of 93 security controls you select from, based on your actual risks.

The 2022 revision (currently in force; the 2013 version has fully sunset as of October 2025) organises those 93 controls into four themes:

| Theme | Count | What it covers |
|---|---|---|
| Organizational (A.5) | 37 | Policies, roles, supplier relationships, incident response |
| People (A.6) | 8 | Screening, NDAs, remote work, training |
| Physical (A.7) | 14 | Facilities, media, equipment |
| Technological (A.8) | 34 | Access control, crypto, logging, secure development, cloud |

The common misconception is that Annex A is a checklist. It isn't. You run a risk assessment first, then pick the controls that address your risks, then justify any exclusions in a document called the **Statement of Applicability** (SoA). An auditor's job isn't to ask *"did you implement all 93?"*, it's to ask *"can you show me why you picked these, and why not those?"*

If you've ever read a SOC 2 report, this will feel familiar. The two systems are cousins. SOC 2 is an AICPA attestation heavy in the US; ISO 27001 is an international standard popular in Europe and Asia. Substantial overlap in what actually gets implemented; different audit regimes and different bits of paper at the end.

## Enter ISO 42001

ISO 42001 is the newer one, published December 2023. It's the first international management system standard for **AI** specifically. Same shape as 27001 (same ISO Harmonized Structure, Clauses 4 through 10), different scope.

What it adds that 27001 doesn't cover:

- **AI Impact Assessments**: structured evaluations of what the AI system could do to individuals, groups, and society. Not a security risk assessment with different labels; a separate thing.
- **Bias and fairness controls**: documented processes for detecting, measuring, and mitigating algorithmic bias.
- **Explainability and transparency**: can you describe why the model did what it did, and to whom do you need to describe it?
- **Human oversight**: specific controls around how humans stay in the loop on AI-driven decisions.
- **AI data governance**: training data quality, provenance, and ongoing validation.
- **Model lifecycle management**: versioning, deployment, monitoring, and retirement of models as first-class managed artefacts.

For anyone building AI features in the EU, 42001 matters for a second reason: the European Commission has signalled it as a fast track for demonstrating compliance with specific EU AI Act articles: Article 9 (risk management), Article 10 (data governance), Article 17 (quality management). It's not a substitute for the AI Act, but it's a meaningful chunk of the evidence you'd otherwise have to produce from scratch.

## How the two relate

If the structure looks familiar, that's because it is. Both standards share the same ISO Annex SL framework. Context, leadership, risk-based thinking, performance evaluation, continual improvement: same verbs, same order.

The practical consequence: organisations certified to ISO 27001 can typically reuse **50–60%** of their documentation, policies, and processes when implementing 42001. Information security controls like access management, encryption, incident response, change management, vendor risk assessments, they all map across. The two don't just coexist; 42001 is deliberately designed to sit on top of 27001 (its Annex D explicitly covers integration with 27001, 27701, and 9001).

Put another way: ISO 27001 protects the confidentiality, integrity, and availability of information. ISO 42001 adds responsible governance of AI systems *on top of that protected foundation*. The AI system can't operate trustworthily if the information layer under it isn't secure, so in practice the two fit together naturally.

## Can you do ISO 42001 without ISO 27001?

Technically, yes. ISO 42001 can be pursued and certified standalone, there's no formal prerequisite.

In practice, it's unusual, and often not advisable. Here's why: AI systems rely on the same information security foundations that 27001 covers: access control, encryption, logging, supplier management, incident response. If you pursue 42001 without an existing ISMS, you end up rebuilding most of 27001 inside the 42001 engagement, just under different labels. You pay the effort either way; running them as one integrated programme is materially faster than sequencing them.

The clean exception is **AI-native organisations** where AI governance is the primary business risk, a company whose core product *is* the model, where shipping AI responsibly is more existential than shipping infrastructure securely. For those, starting with 42001 is defensible. For everyone else (any company whose AI is one feature among many), 27001 first (or both together) is the pragmatic path.

One subtler point on certification bodies: your auditor needs **separate accreditation** for each standard. Not every 27001 body is yet accredited for 42001, because the standard is still new. If you're targeting certification (not just alignment), check your chosen body's scope with the relevant national accreditation body (UKAS in the UK, DAkkS in Germany, ANAB in the US, SAS in Switzerland) before signing.

## "Aligned" vs "Certified": what the words actually mean

This is where most people stumble, and honestly, it's where some vendors quietly mislead.

| Term | What it actually means |
|---|---|
| **Aligned / compliant** | You've built your ISMS to follow the standard. Self-declared. No external auditor has verified it. |
| **Certified (non-accredited)** | You paid a certification body that isn't formally accredited. Cheaper, faster, but enterprise procurement teams often reject it. |
| **Certified (accredited)** | Audited by a body that's itself accredited by a national accreditation body. This is the real thing, the certificate enterprise buyers and government tenders will accept. |

"Aligned" is real work. Building an ISMS, writing the policies, implementing the controls, documenting the SoA, running internal audits, none of that is trivial, and all of it is the same work you'd do to eventually get certified. What "aligned" does **not** give you is the independent verification. An auditor hasn't sat in your conference room for two weeks going through evidence, and no accreditation body has stamped the result.

That matters differently depending on who's asking:

- **Small/medium customers, security questionnaires, SOC 2-friendly procurement**: "aligned" is often fine. Send your policies, your SoA, your penetration test report, a recent audit log sample. Done.
- **Enterprise tenders, regulated industries, government contracts**: you need accredited certification. "Aligned" gets rejected.
- **Investor / due diligence conversations**: depends. A Series A probably accepts "aligned plus clear plan to certify." A pre-IPO round probably doesn't.

The useful way to think about it: **aligned is the state you need to be in before you can be certified**. You don't skip alignment to get certified; certification just adds the external auditor on top.

## The practical path

For a small or mid-sized EU company shipping software (especially if there's AI in the mix), the realistic sequence is:

1. **Start by aligning to ISO 27001.** Build the ISMS, implement the right controls for your risk profile, write the Statement of Applicability. 6–12 months of work, mostly internal, with or without outside help. You'll come out with a real security posture and the documentation to explain it.
2. **Add ISO 42001 alignment if you ship AI features.** On top of an aligned 27001 baseline, this is typically 10–16 weeks of incremental AI-specific work. You'll produce AI impact assessments, bias/fairness processes, model lifecycle documentation, and explainability artifacts.
3. **Upgrade to certification when a deal demands it.** If an enterprise customer blocks a contract on an accredited certificate, *that's* the signal to start the external audit. Budget: €15–60k in certification-body fees, €60–300k in internal effort depending on organisation size, though if you've already done the alignment work properly, much of that internal cost collapses because the evidence already exists.

The trap I see repeatedly is companies pursuing 42001 first without 27001, discovering they need the security baseline anyway, and paying for both audits sequentially instead of as one integrated engagement. Avoid that.

<div class="fil-callout" markdown="1">
**Curious where you stand right now?** I built a quick, plain-terms self-assessment:
profile your business, work through the controls, get a rough alignment score
(and the gaps worth tackling first). It's not a certification, just an honest read.

<span class="fil-callout-cta">→ [Take the ISO 27001 self-assessment](/tools/iso-27001-self-assessment/)</span>
</div>

## How I help

I can't certify your organisation, that's the job of an accredited certification body, and being accredited is a specific legal/regulatory status I don't hold. But I can get you to *aligned*, which is most of the work:

- Build the ISMS: policies, procedures, Statement of Applicability
- Implement the Annex A controls that match your actual risk profile (not all 93; just the ones that apply)
- For AI features, layer in the 42001-specific controls: impact assessments, model lifecycle, bias/fairness processes
- Produce the evidence pack (audit logs, access reviews, incident records) your customers' security questionnaires actually ask for
- Run an internal audit so you know where you stand before you ever invite an external one

When you're ready for formal certification, I'll help you pick an accredited certification body with proper scope and prep your team for the Stage 1 and Stage 2 audits. I won't be the one stamping the certificate, but I'll get you in a state where stamping it is a formality.

This fits naturally alongside the [AI build](/work-with-me/#ai-that-fits-your-stack) and [AI security review](/work-with-me/#ai-security-review) work, most teams needing one end up wanting the others too.

---

**The caveat:** regulation around AI and information security is still moving. The EU AI Act's implementing acts are still landing; ISO 42001's accredited-certification-body network is still being built out. If you're selling on "certified" language, work with an accredited body directly. If you're building for "aligned," you're doing real and defensible work, just don't oversell the words.

Do take these with a grain of salt; your specific context (industry, jurisdiction, customer base) will shape what "enough" means in your case.

---

*Sources & further reading:*
- [ISO/IEC 27001:2022 Annex A — ISMS.online](https://www.isms.online/iso-27001/annex-a-2022/)
- [ISO 42001 vs ISO 27001 — ISMS.online](https://www.isms.online/iso-42001/vs-iso-27001/)
- [Integrating ISO 27001 and ISO 42001 — A-LIGN](https://www.a-lign.com/articles/iso-42001-vs-iso-27001)
- [ISO 42001 certification: what it actually takes — Modulos AI](https://www.modulos.ai/blog/iso-42001-certification-guide/)
- [Verifying vendor ISO 27001 certification — MetaCompliance](https://www.metacompliance.com/blog/cyber-security-awareness/are-your-vendors-really-iso27001-certified)
