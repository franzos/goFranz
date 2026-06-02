---
layout: page
title: "ISO 27001 Self-Assessment"
permalink: /tools/iso-27001-self-assessment/
js_assessment: true
description: "A plain-terms, interactive ISO 27001 (and optional ISO 42001) self-assessment. Profile your business, work through the controls, get a rough alignment score. Not a certification."
---

A quick, honest read on where you stand against **ISO 27001** — and, if you ship
AI, **ISO 42001** on top. Answer a short profile so you're only scored on what's
relevant, work through the areas, and you'll get a rough alignment score plus the
gaps worth tackling next.

This is a plain-terms overview, **not** a certification or an official audit. For
the difference between *aligned* and *certified*, see
[the write-up]({% post_url 2026/2026-04-23-iso-27001-42001-what-aligned-actually-means %}).

<noscript>
This self-assessment needs JavaScript to run. It's a rough, non-authoritative
readiness check — not a certification.
</noscript>

<script type="application/json" id="assessment-data">
{{ site.data['iso-assessment'] | jsonify }}
</script>

<div id="iso-assessment"></div>
