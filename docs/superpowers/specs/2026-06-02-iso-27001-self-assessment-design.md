# ISO 27001 Self-Assessment Tool — Design

**Date:** 2026-06-02
**Status:** Approved (pending spec review)

## Summary

An interactive, client-side "ISO 27001 alignment self-assessment" on a dedicated
page (`/tools/iso-27001-self-assessment/`), reached via a call-out from the blog post
`_posts/2026/2026-04-23-iso-27001-42001-what-aligned-actually-means.md`.

The visitor answers a short profile (which marks irrelevant controls Not
Applicable), works through plain-language readiness questions grouped by theme —
each expandable to the real ISO controls it represents — and gets a rough
alignment percentage, per-theme bars, and a list of their gaps. If they ship AI,
an optional ISO 42001 governance layer unlocks with its own sub-score.

It is explicitly **not** a certification or an authoritative audit — a plain-terms
overview and a rough "are we there?" signal. It doubles as a soft lead magnet for
the [AI build](/ai-build/) and [AI security review](/ai-security-review/) services.

## Goals

- Give a visitor an honest, fast read on where they stand against ISO 27001.
- Represent the **complete** standard (all 93 Annex A controls + Clauses 4–10)
  without making anyone tick 93 boxes — by clustering controls under ~30
  plain-language questions.
- Teach the Statement of Applicability concept by doing (profile → N/A exclusions).
- Stay private: no backend, no account, no email gate, nothing leaves the browser.
- Bridge naturally to the services without a hard sell.

## Non-goals

- Not a certification, audit, or official compliance check.
- No backend, no lead capture, no email gate.
- No PDF/print export in v1 (a screenshot suffices; revisit later if asked).

## Product decisions (locked)

1. **Two-tier content, complete coverage.** ~30 plain-language questions are the
   scoring unit. Each question is a cluster that maps to the real underlying
   controls, shown when the question is expanded. Every one of the 93 Annex A
   controls and the management clauses is present and accounted for — nothing is
   dropped or hidden. The score is computed on the questions, not on 93 boxes.
2. **Dedicated page**, not embedded in the post. The post gets a call-out linking
   to `/tools/iso-27001-self-assessment/`.
3. **Profile-based applicability + theme view-filter.** 4–5 binary profile
   questions (physical offices? employees beyond founders? cloud infrastructure?
   ship AI to external users?) mark whole controls/themes Not Applicable; N/A
   items are excluded from the score (mirrors a real SoA). A dropdown filters/
   navigates by theme.
4. **ISO 27001 core + optional ISO 42001 layer.** The 42001 AI-governance group
   (impact assessments, bias/fairness, explainability, human oversight, AI data
   governance, model lifecycle) stays hidden until the profile says "we ship AI",
   then appears with its **own** sub-score, separate from the 27001 score.
5. **Purely client-side & private.** Progress in `localStorage`. Results = an
   alignment **percentage** + per-theme bars + a "your gaps" list grouped by
   theme (no weighting). A one-line "rough self-assessment, not a certification"
   disclaimer sits next to the score. Soft CTA to the services at the end.

## Architecture

The site is Jekyll + esbuild (vanilla JS bundles) + SCSS, with Filament CSS-var
theming (`--bg`, `--ink`, `--line`, … under `:root[data-bs-theme]`).

**Data → JSON blob → JS owns the DOM.** Content lives in
`_data/iso-assessment.yml`. The page renders it once as a JSON blob via Liquid;
a single vanilla-JS module reads the blob and renders the entire UI into one
mount point. There is **no** Liquid-rendered checkbox skeleton — that would create
two sources of truth (DOM + JS model) and silently corrupt the score when content
changes. This mirrors the existing mapbox pattern, where Liquid renders GeoJSON
into a `<script>` block that JS then consumes (`_includes/footer.html`).

```html
<noscript>This self-assessment needs JavaScript. It's a rough,
  non-authoritative readiness check — not a certification.</noscript>

<script type="application/json" id="assessment-data">
  {{ site.data.iso-assessment | jsonify }}
</script>

<div id="iso-assessment"></div>
```

JS reads `#assessment-data` on `DOMContentLoaded`, renders profile → questions →
results into `#iso-assessment`, and owns all interaction and state.

### Asset loading (corrected mechanism)

The page lives at `tools/iso-27001-self-assessment.md` (in a `tools/` folder, not
dumped at repo root) with `permalink: /tools/iso-27001-self-assessment/`. The
`/tools/` namespace is reserved now; no `/tools/` index/hub page is built until a
second tool exists — at which point a `tools/index.html` drops in and lists both
with no migration or redirect. The page uses the normal layout chain
(`layout: page`), **not** the standalone
`product.html` layout (which emits its own `<head>`/`<body>` and skips
`header.html`/`footer.html`), and **not** a new layout. Page-specific assets are
loaded conditionally on a front-matter flag, exactly as `mermaid`/`mapbox` are:

- Front matter: `js_assessment: true`
- `_includes/header.html` — after the `main.min.css` link (line ~52):
  ```liquid
  {% if page.js_assessment %}<link href="/assets/css/iso-assessment.min.css" rel="stylesheet">{% endif %}
  ```
- `_includes/footer.html` — after the mermaid conditional (line ~5):
  ```liquid
  {% if page.js_assessment %}<script src="/assets/js/iso-assessment.min.js"></script>{% endif %}
  ```

CSS goes in the head (avoids FOUC); JS at the foot. `main.min.css` is always
loaded, so the Filament theme vars are available — the assessment SCSS only adds
component styles scoped under `.iso-assessment` (or `#iso-assessment`).

### Build config

`esbuild.config.js` currently sets a shared `globalName: 'MainApp'` across the
whole build context. The assessment bundle must be self-contained and export no
global. Split the build into two `esbuild.build()` calls (or otherwise isolate the
new entry) so `MainApp` does not apply to it. Add:

- JS entry: `'iso-assessment.min': 'src/js/iso-assessment.js'`
- SCSS target: `src/scss/iso-assessment.scss → assets/css/iso-assessment.min.css`

## Data model — `_data/iso-assessment.yml`

```yaml
profile:
  - id: physical
    q: "Do you operate your own physical offices or facilities?"
    na_themes_if_no: [physical]      # marks the whole Physical theme N/A
  - id: employees
    q: "Do you have employees beyond the founders?"
    na_themes_if_no: [people]
  - id: cloud
    q: "Do you run cloud or hosted infrastructure?"
  - id: ai
    q: "Do you build or ship AI/ML features to external users?"
    unlocks: iso42001                # reveals the 42001 group + sub-score

themes:
  - id: management
    iso_layer: "27001"
    label: "Management System (Clauses 4–10)"
    items:
      - id: m-risk-assessment        # STABLE slug — never changes even if q is reworded
        q: "Do you run a documented information security risk assessment?"
        controls: ["Clause 6.1.2 — Risk assessment", "Clause 8.2 — Risk assessment"]
      - id: m-policy
        q: "Is there a written infosec policy leadership has signed off?"
        controls: ["Clause 5.2 — Policy", "A.5.1 — Policies for information security"]
      # ...
  - id: org
    iso_layer: "27001"
    label: "Organizational (A.5)"
    items: [ ... ]                    # clusters covering all 37 A.5 controls
  - id: people
    iso_layer: "27001"
    label: "People (A.6)"
    items: [ ... ]                    # all 8 A.6 controls
  - id: physical
    iso_layer: "27001"
    label: "Physical (A.7)"
    items: [ ... ]                    # all 14 A.7 controls
  - id: tech
    iso_layer: "27001"
    label: "Technological (A.8)"
    items: [ ... ]                    # all 34 A.8 controls
  - id: iso42001
    iso_layer: "42001"
    label: "AI Governance (ISO 42001)"
    items: [ ... ]                    # AI impact, bias/fairness, explainability,
                                      # human oversight, AI data gov, model lifecycle
```

Notes:

- **No `weight` field** — gaps are grouped by theme in document order; weighting
  was dropped.
- `id` on every item is a **stable slug** used as the `localStorage` key and the
  scoring key. The `q` text can be reworded freely without breaking saved state;
  only adding/removing/renaming an `id` changes the schema (see versioning).
- Every Annex A control appears in some item's `controls` list. Coverage of all
  93 + clauses is a content-authoring requirement, tracked at authoring time.

## Scoring & state

**Score** = checked applicable questions ÷ total applicable questions × 100,
rendered as a percentage with a band label and the disclaimer beside it.

- The **42001 sub-score** is computed and shown separately; it does not blend into
  the 27001 score. When the AI profile answer is toggled on, surface that the
  layer added N questions ("AI governance layer: N additional questions").
- Per-theme **progress bars** use the same applicable-only ratio, each guarded
  independently.

**Edge-case guards (required):**

- Zero applicable questions overall (or per theme) → show "No applicable controls"
  rather than `NaN`/`Infinity`. Never divide by zero.
- A theme entirely N/A is shown as N/A, not 0%.

**`localStorage` schema (versioned):**

```json
{ "version": "<hash-of-all-item-ids>", "profile": { "physical": true, ... },
  "checks": { "m-risk-assessment": true, ... } }
```

- `version` is derived from the sorted list of item IDs (a build-time value — e.g.
  Liquid `... | sort | join | sha1`, or a content-derived constant). It must not
  be a hand-bumped string someone forgets to update.
- On load, if stored `version` ≠ current → clear state and show a one-line notice:
  "The assessment was updated — your previous progress has been reset."

## Components / units

- `_data/iso-assessment.yml` — content (profile + themes + items), single source
  of truth. Editable without touching code.
- `iso-assessment.md` — the page: front matter, disclaimer, `<noscript>`, JSON
  blob, mount div.
- `src/js/iso-assessment.js` — reads the blob; renders profile, question list
  (two-tier expand), theme filter, score, per-theme bars, gap list; persists to
  versioned `localStorage`; computes scores with the guards above. Self-contained,
  no global export.
- `src/scss/iso-assessment.scss` — component styles scoped under
  `#iso-assessment`, reusing Filament theme vars from `main.min.css`.
- Conditional asset includes in `header.html` / `footer.html`.
- Call-out in the blog post.

## UX flow

1. **Profile** (4–5 yes/no). Sets applicability; the AI answer unlocks the 42001
   group. Re-openable so a visitor can change answers and watch the score adjust.
2. **Assessment.** Themes with plain-language questions; each question expands to
   its underlying controls. A theme-filter dropdown narrows the view. N/A items
   are visibly excluded. State persists live.
3. **Results.** Alignment percentage + band + disclaimer; per-theme bars; gaps
   grouped by theme; separate 42001 sub-score when applicable; soft CTA to
   [AI build](/ai-build/) / [AI security review](/ai-security-review/).

## File-by-file build plan

1. **Content** — create `_data/iso-assessment.yml` (profile + all themes/items;
   complete control coverage; stable `id`s; no `weight`).
2. **Build config** — modify `esbuild.config.js`: add the JS entry point and SCSS
   target; split the build so `globalName: 'MainApp'` does not apply to the new
   bundle.
3. **Styles** — create `src/scss/iso-assessment.scss` (scoped, Filament vars).
4. **JS** — create `src/js/iso-assessment.js` (render + state + scoring + guards +
   versioned localStorage).
5. **Page** — create `tools/iso-27001-self-assessment.md`: `layout: page`,
   `title`, `permalink: /tools/iso-27001-self-assessment/`, `js_assessment: true`.
   Body: disclaimer, `<noscript>`, JSON blob, mount div. No `/tools/` index page in
   v1 — the namespace is reserved, the hub waits for a second tool.
6. **Asset loading** — modify `_includes/header.html` (conditional CSS link) and
   `_includes/footer.html` (conditional JS script), gated on `page.js_assessment`.
7. **Call-out** — modify the blog post: insert a call-out (e.g. a `.fil-callout`
   block) before the "How I help" section linking to
   `/tools/iso-27001-self-assessment/`.

## Risks & mitigations

- **Content volume / honesty.** Complete coverage is the whole point; clustering
  into ~30 questions keeps it usable while every control stays visible under its
  question. Authoring the clusters is the bulk of the effort.
- **Stale saved state.** Handled by the versioned localStorage schema + reset
  notice.
- **`globalName` collision.** Handled by splitting the esbuild build.
- **JSON blob size.** Acceptable for a tool page; keep control reference strings
  concise.

## Dropped / out of scope (YAGNI)

- Weighted gap ordering — dropped; theme-grouped instead.
- Print/PDF export — out of v1.
- Email capture / backend / accounts — never (privacy by design).
- A bespoke layout — not needed; the conditional-include pattern covers it.
