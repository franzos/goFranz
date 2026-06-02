# ISO 27001 Self-Assessment Tool — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive, client-side ISO 27001 (+ optional ISO 42001) alignment self-assessment at `/tools/iso-27001-self-assessment/`, reached via a call-out from the related blog post.

**Architecture:** Content lives in `_data/iso-assessment.yml`. Jekyll renders it once as a JSON blob into the page; a vanilla-JS entry reads the blob and owns the entire DOM (profile gating, two-tier questions, theme filter, scoring, gap list) with progress persisted to versioned `localStorage`. The pure scoring/applicability/versioning logic is isolated in `src/js/iso-assessment/scoring.js` and unit-tested. Page-specific CSS/JS bundles load conditionally via a `js_assessment` front-matter flag, exactly as `mermaid`/`mapbox` already do.

**Tech Stack:** Jekyll (Liquid + YAML data), esbuild (IIFE bundles), Dart Sass CLI, vanilla ES2017 JS, Node's built-in `node --test` runner (zero new dependencies).

---

## Testing reality (read first)

This repo has **no JS test framework** and no existing tests. Introducing jest/vitest/jsdom for one widget is unjustified. Instead:

- **Pure logic** (`scoring.js`) is unit-tested with **Node's built-in test runner** (`node --test`) — available in the Node already used to run esbuild, no new dependency. This is the TDD core of the plan.
- **DOM rendering, persistence, Jekyll output** are verified by building the assets (`npm run build:assets`), building the site (`npm run build`), and a manual browser checklist (Task 11). There is no automated DOM test.

Be honest about this split when reporting completion: the scoring logic is test-covered; the UI is build- and manually-verified.

## File structure

| File | Responsibility | Action |
|---|---|---|
| `_data/iso-assessment.yml` | All content: profile questions + themes + items + control references | Create |
| `src/js/iso-assessment/scoring.js` | Pure logic: applicability, scoring (with zero-guards), per-theme progress, gap grouping, schema version hash. No DOM. | Create |
| `src/js/iso-assessment/scoring.test.js` | `node --test` unit tests for `scoring.js` | Create |
| `src/js/iso-assessment.js` | Entry: read JSON blob, build DOM, wire events, versioned localStorage, call scoring, render results | Create |
| `src/scss/iso-assessment.scss` | Component styles scoped under `#iso-assessment`, using `--fil-*` tokens | Create |
| `tools/iso-27001-self-assessment.md` | The page: front matter, disclaimer, `<noscript>`, JSON blob, mount div | Create |
| `esbuild.config.js` | Add JS entry (separate build, no `globalName`) + SCSS target | Modify |
| `package.json` | Add the new SCSS pair to the `sass` script | Modify |
| `_includes/header.html` | Conditional CSS link on `page.js_assessment` | Modify |
| `_includes/footer.html` | Conditional JS script on `page.js_assessment` | Modify |
| `src/scss/custom.scss` | Add a site-wide `.fil-callout` style (post callout loads `main.min.css`, not the tool bundle) | Modify |
| `_posts/2026/2026-04-23-iso-27001-42001-what-aligned-actually-means.md` | Insert the call-out before "How I help" | Modify |

---

## Task 1: Pure scoring module (TDD)

**Files:**
- Create: `src/js/iso-assessment/scoring.js`
- Test: `src/js/iso-assessment/scoring.test.js`

This is CommonJS (the repo's package.json has no `"type": "module"`), so `require`/`module.exports` work under both `node --test` and esbuild bundling.

- [ ] **Step 1: Write the failing tests**

Create `src/js/iso-assessment/scoring.test.js`:

```js
const test = require('node:test')
const assert = require('node:assert/strict')
const s = require('./scoring.js')

const DATA = {
  profile: [
    { id: 'physical', q: 'Offices?', na_themes_if_no: ['physical'] },
    { id: 'employees', q: 'Staff?', na_themes_if_no: ['people'] },
    { id: 'ai', q: 'AI?', unlocks: 'iso42001' },
  ],
  themes: [
    { id: 'management', iso_layer: '27001', label: 'Mgmt', items: [
      { id: 'm1', q: 'q', controls: ['Clause 6.1.2'] },
      { id: 'm2', q: 'q', controls: ['A.5.1'] },
    ] },
    { id: 'people', iso_layer: '27001', label: 'People', items: [
      { id: 'p1', q: 'q', controls: ['A.6.1'] },
    ] },
    { id: 'physical', iso_layer: '27001', label: 'Physical', items: [
      { id: 'ph1', q: 'q', controls: ['A.7.1'] },
    ] },
    { id: 'iso42001', iso_layer: '42001', label: 'AI', items: [
      { id: 'ai1', q: 'q', controls: ['Impact assessment'] },
    ] },
  ],
}

test('schemaVersion is stable for same ids and changes when ids change', () => {
  const v1 = s.schemaVersion(DATA)
  const v2 = s.schemaVersion(JSON.parse(JSON.stringify(DATA)))
  assert.equal(v1, v2)
  const mutated = JSON.parse(JSON.stringify(DATA))
  mutated.themes[0].items.push({ id: 'm3', q: 'q', controls: ['A.5.2'] })
  assert.notEqual(s.schemaVersion(mutated), v1)
})

test('resolveApplicability marks themes N/A on "no" and locks 42001 unless AI', () => {
  const r = s.resolveApplicability(DATA, { physical: false, ai: false })
  assert.equal(r.naThemes.has('physical'), true)
  assert.equal(r.naThemes.has('iso42001'), true) // locked by default
  assert.equal(r.aiUnlocked, false)
})

test('resolveApplicability unlocks 42001 when AI is yes', () => {
  const r = s.resolveApplicability(DATA, { ai: true })
  assert.equal(r.naThemes.has('iso42001'), false)
  assert.equal(r.aiUnlocked, true)
})

test('computeScore counts only applicable items of the layer', () => {
  const { naThemes } = s.resolveApplicability(DATA, { physical: false, ai: false })
  const score = s.computeScore(DATA, { m1: true }, naThemes, '27001')
  // applicable 27001 items: m1, m2, p1 (physical N/A excluded) = 3; checked = 1
  assert.deepEqual(score, { checked: 1, total: 3, percent: 33 })
})

test('computeScore returns null when no applicable items (no divide-by-zero)', () => {
  const { naThemes } = s.resolveApplicability(DATA, { ai: false })
  const score = s.computeScore(DATA, {}, naThemes, '42001') // 42001 locked => null
  assert.equal(score, null)
})

test('computeGaps groups unchecked applicable items by theme, skips N/A', () => {
  const { naThemes } = s.resolveApplicability(DATA, { physical: false, ai: false })
  const gaps = s.computeGaps(DATA, { m1: true }, naThemes)
  const labels = gaps.map(g => g.theme)
  assert.deepEqual(labels, ['Mgmt', 'People']) // physical excluded, iso42001 locked
  assert.deepEqual(gaps[0].items.map(i => i.id), ['m2'])
})

test('themeProgress reports applicable themes with guarded percent', () => {
  const { naThemes } = s.resolveApplicability(DATA, { physical: false, ai: true })
  const prog = s.themeProgress(DATA, { m1: true, m2: true }, naThemes)
  const mgmt = prog.find(t => t.id === 'management')
  assert.deepEqual({ checked: mgmt.checked, total: mgmt.total, percent: mgmt.percent },
    { checked: 2, total: 2, percent: 100 })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test src/js/iso-assessment/`
Expected: FAIL — `Cannot find module './scoring.js'`.

- [ ] **Step 3: Write the implementation**

Create `src/js/iso-assessment/scoring.js`:

```js
// Pure assessment logic — no DOM. Runnable under `node --test` and bundled by esbuild.

function collectItemIds(data) {
  const ids = []
  for (const theme of data.themes) for (const item of theme.items) ids.push(item.id)
  return ids
}

// Stable, dependency-free FNV-1a hash of the sorted item-id list.
// Used as the localStorage schema version: it changes only when items are
// added/removed/renamed, so reworded questions never reset saved progress.
function schemaVersion(data) {
  const str = collectItemIds(data).sort().join('|')
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16)
}

// Profile answers -> set of N/A theme ids + whether the 42001 layer is unlocked.
function resolveApplicability(data, profile) {
  const naThemes = new Set()
  let aiUnlocked = false
  for (const q of data.profile) {
    const ans = profile[q.id]
    if (q.na_themes_if_no && ans === false) q.na_themes_if_no.forEach(t => naThemes.add(t))
    if (q.unlocks && ans === true) aiUnlocked = true
  }
  const aiTheme = data.themes.find(t => t.iso_layer === '42001')
  if (aiTheme && !aiUnlocked) naThemes.add(aiTheme.id)
  return { naThemes, aiUnlocked }
}

// Score for one ISO layer ('27001' | '42001'). null when zero applicable items.
function computeScore(data, checks, naThemes, layer) {
  let total = 0, checked = 0
  for (const theme of data.themes) {
    if (theme.iso_layer !== layer || naThemes.has(theme.id)) continue
    for (const item of theme.items) {
      total++
      if (checks[item.id]) checked++
    }
  }
  if (total === 0) return null
  return { checked, total, percent: Math.round((checked / total) * 100) }
}

// Per-theme progress for applicable themes only (each percent guarded).
function themeProgress(data, checks, naThemes) {
  return data.themes
    .filter(t => !naThemes.has(t.id))
    .map(t => {
      const total = t.items.length
      const checked = t.items.filter(i => checks[i.id]).length
      return { id: t.id, label: t.label, layer: t.iso_layer, checked, total,
        percent: total === 0 ? null : Math.round((checked / total) * 100) }
    })
}

// Unchecked applicable items, grouped by theme in document order.
function computeGaps(data, checks, naThemes) {
  const groups = []
  for (const theme of data.themes) {
    if (naThemes.has(theme.id)) continue
    const items = theme.items.filter(i => !checks[i.id])
    if (items.length) groups.push({ themeId: theme.id, theme: theme.label, items })
  }
  return groups
}

module.exports = {
  collectItemIds, schemaVersion, resolveApplicability,
  computeScore, themeProgress, computeGaps,
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test src/js/iso-assessment/`
Expected: PASS — 7 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add src/js/iso-assessment/scoring.js src/js/iso-assessment/scoring.test.js
git commit -m "feat: add ISO assessment scoring logic with tests"
```

---

## Task 2: Build wiring (esbuild + package.json)

**Files:**
- Modify: `esbuild.config.js`
- Modify: `package.json`

The assessment JS must build as a **separate** esbuild call so the shared `globalName: 'MainApp'` does not apply to it. The SCSS uses the existing Dart Sass CLI path (`sassTargets` + the `package.json` `sass` script).

- [ ] **Step 1: Add a separate assessment JS build config**

In `esbuild.config.js`, immediately after the `buildConfig` object closes (after the line `}` that ends `globalName: 'MainApp', plugins: [] }`), add:

```js
// Assessment tool — built separately so it gets NO global export (no `globalName`),
// keeping it isolated from the main bundle that loads on the same page.
const assessmentConfig = {
  entryPoints: { 'iso-assessment.min': 'src/js/iso-assessment.js' },
  bundle: true,
  outdir: 'assets/js',
  format: 'iife',
  minify: false,
  keepNames: true,
  sourcemap: false,
  target: ['es2017'],
  outExtension: { '.js': '.js' },
  splitting: false,
}
```

- [ ] **Step 2: Add the SCSS target**

In `esbuild.config.js`, add to the `sassTargets` array (after the `software-iced-webview` line):

```js
  'src/scss/iso-assessment.scss:assets/css/iso-assessment.min.css'
```

- [ ] **Step 3: Build the assessment JS in both build modes**

In `esbuild.config.js`, in the `build()` function's **watch** branch, after `await jsContext.watch()`, add:

```js
      const assessmentContext = await esbuild.context(assessmentConfig)
      await assessmentContext.watch()
```

And add `assessmentContext.dispose()` next to the existing `jsContext.dispose()` in the SIGINT handler.

In the **non-watch** branch, after `await esbuild.build(buildConfig)` and its `console.log`, add:

```js
      await esbuild.build(assessmentConfig)
      console.log('✅ Assessment JS built')
```

- [ ] **Step 4: Mirror the SCSS pair into the package.json `sass` script**

In `package.json`, append to the `sass` script value (before `--style=compressed`):

```
src/scss/iso-assessment.scss:assets/css/iso-assessment.min.css
```

Resulting script (single line):

```json
"sass": "sass src/scss/main.scss:assets/css/main.min.css src/scss/software-stackpit.scss:assets/css/software-stackpit.min.css src/scss/software-forseti.scss:assets/css/software-forseti.min.css src/scss/software-guix-rs.scss:assets/css/software-guix-rs.min.css src/scss/software-iced-webview.scss:assets/css/software-iced-webview.min.css src/scss/iso-assessment.scss:assets/css/iso-assessment.min.css --style=compressed"
```

- [ ] **Step 5: Verify the build fails cleanly on the missing source files**

Run: `npm run build:assets`
Expected: FAIL — esbuild errors that `src/js/iso-assessment.js` cannot be resolved (and/or sass errors on missing `src/scss/iso-assessment.scss`). This confirms the wiring points at the right paths. (These files are created in Tasks 3–4.)

- [ ] **Step 6: Commit**

```bash
git add esbuild.config.js package.json
git commit -m "build: wire iso-assessment js/css bundles"
```

---

## Task 3: Component styles

**Files:**
- Create: `src/scss/iso-assessment.scss`

Uses the Filament tokens (`--fil-*`) already defined on `body.fil` in `custom.scss`. The page uses a `fil` layout (Task 6), so the tokens are in scope. Scope everything under `#iso-assessment`.

- [ ] **Step 1: Write the stylesheet**

Create `src/scss/iso-assessment.scss`:

```scss
#iso-assessment {
  --ia-good: #2f7d32;
  --ia-mid: var(--fil-amber);
  margin: 1.5rem 0 0;

  .ia-reset, .ia-disclaimer {
    font-size: .85rem;
    color: var(--fil-ink-soft);
  }
  .ia-reset {
    border: 1px solid var(--fil-line-2);
    background: var(--fil-glow);
    padding: .5rem .75rem;
    border-radius: 6px;
    margin-bottom: 1rem;
  }

  .ia-panel {
    background: var(--fil-panel);
    border: 1px solid var(--fil-line);
    border-radius: 10px;
    padding: 1.1rem 1.25rem;
    margin-bottom: 1.25rem;
  }
  .ia-panel > h2 {
    font-size: 1.05rem;
    margin: 0 0 .25rem;
    letter-spacing: .02em;
  }
  .ia-panel-sub { color: var(--fil-ink-soft); font-size: .9rem; margin: 0 0 .9rem; }

  .ia-profile-q {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: .5rem 0;
    border-top: 1px solid var(--fil-line);
  }
  .ia-profile-q:first-of-type { border-top: 0; }
  .ia-toggle { display: inline-flex; gap: .35rem; flex: none; }
  .ia-toggle label {
    cursor: pointer;
    border: 1px solid var(--fil-line-2);
    border-radius: 999px;
    padding: .15rem .8rem;
    font-size: .85rem;
  }
  .ia-toggle input { position: absolute; opacity: 0; pointer-events: none; }
  .ia-toggle input:checked + span { font-weight: 700; }
  .ia-toggle label:has(input:checked) {
    border-color: var(--fil-accent);
    background: var(--fil-glow-p);
    color: var(--fil-accent-bright);
  }

  .ia-toolbar {
    display: flex;
    gap: .75rem;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  .ia-toolbar select {
    border: 1px solid var(--fil-line-2);
    border-radius: 6px;
    padding: .35rem .6rem;
    background: var(--fil-bg-2);
    color: var(--fil-ink);
    font: inherit;
  }

  .ia-theme.is-na { opacity: .45; }
  .ia-theme.is-na .ia-item input { pointer-events: none; }
  .ia-theme.is-hidden { display: none; }
  .ia-theme-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
    margin: 0 0 .4rem;
  }
  .ia-theme-head h3 { font-size: 1rem; margin: 0; }
  .ia-na-badge {
    font-size: .72rem;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--fil-ink-soft);
    border: 1px solid var(--fil-line-2);
    border-radius: 4px;
    padding: .05rem .4rem;
    display: none;
  }
  .ia-theme.is-na .ia-na-badge { display: inline-block; }

  .ia-item { padding: .45rem 0; border-top: 1px solid var(--fil-line); }
  .ia-item label {
    display: flex;
    gap: .6rem;
    align-items: flex-start;
    cursor: pointer;
  }
  .ia-item input { margin-top: .35rem; flex: none; }
  .ia-item details { margin: .3rem 0 0 1.8rem; }
  .ia-item summary {
    cursor: pointer;
    font-size: .82rem;
    color: var(--fil-accent-bright);
  }
  .ia-item details ul {
    margin: .4rem 0 0;
    padding-left: 1.1rem;
    font-size: .85rem;
    color: var(--fil-ink-soft);
  }

  // Results
  .ia-score { display: flex; align-items: baseline; gap: .6rem; }
  .ia-score b { font-size: 2.4rem; line-height: 1; color: var(--fil-accent-bright); }
  .ia-score .ia-band { font-weight: 700; }
  .ia-subscore { margin-top: .4rem; color: var(--fil-ink-soft); font-size: .9rem; }

  .ia-bar { margin: .5rem 0; }
  .ia-bar-label { display: flex; justify-content: space-between; font-size: .85rem; }
  .ia-bar-track {
    height: 8px;
    background: var(--fil-line);
    border-radius: 999px;
    overflow: hidden;
  }
  .ia-bar-fill { height: 100%; background: var(--ia-good); }

  .ia-gaps h3 { font-size: 1rem; margin: 1rem 0 .3rem; }
  .ia-gaps ul { margin: .2rem 0 .8rem; padding-left: 1.1rem; }
  .ia-cta {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--fil-line);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/scss/iso-assessment.scss
git commit -m "feat: add iso-assessment styles"
```

---

## Task 4: Content data file

**Files:**
- Create: `_data/iso-assessment.yml`

This is the content source of truth. The schema is fixed by Task 1's logic; the **completeness** of control coverage is a content requirement verified in Step 2.

- [ ] **Step 1: Create the data file with the full schema and seed content**

Create `_data/iso-assessment.yml`. Below is the required structure with a representative, **complete** set for the management + people + physical + 42001 themes and a partial `org`/`tech` to be finished in Step 2. Every `id` is a stable slug; `q` is plain language; `controls` lists the real ISO references the question represents.

```yaml
profile:
  - id: physical
    q: "Do you operate your own physical offices or facilities?"
    na_themes_if_no: [physical]
  - id: employees
    q: "Do you have employees beyond the founders?"
    na_themes_if_no: [people]
  - id: cloud
    q: "Do you run cloud or hosted infrastructure?"
  - id: ai
    q: "Do you build or ship AI/ML features to external users?"
    unlocks: iso42001

themes:
  - id: management
    iso_layer: "27001"
    label: "Management System (Clauses 4–10)"
    items:
      - id: m-scope
        q: "Have you defined the scope of your security programme in writing?"
        controls: ["Clause 4.3 — Scope of the ISMS"]
      - id: m-policy
        q: "Is there a written information security policy leadership has signed off?"
        controls: ["Clause 5.2 — Policy", "A.5.1 — Policies for information security"]
      - id: m-roles
        q: "Are security roles and responsibilities assigned to named people?"
        controls: ["Clause 5.3 — Roles & responsibilities", "A.5.2 — Information security roles"]
      - id: m-risk
        q: "Do you run a documented information security risk assessment?"
        controls: ["Clause 6.1.2 — Risk assessment", "Clause 8.2 — Risk assessment"]
      - id: m-treatment
        q: "Do you have a risk treatment plan and a Statement of Applicability?"
        controls: ["Clause 6.1.3 — Risk treatment", "Clause 6.1.3 d) — Statement of Applicability"]
      - id: m-objectives
        q: "Have you set measurable security objectives?"
        controls: ["Clause 6.2 — Information security objectives"]
      - id: m-internal-audit
        q: "Do you run internal audits of your security programme?"
        controls: ["Clause 9.2 — Internal audit"]
      - id: m-management-review
        q: "Does leadership formally review security performance on a schedule?"
        controls: ["Clause 9.3 — Management review"]
      - id: m-improvement
        q: "Do you track nonconformities and corrective actions?"
        controls: ["Clause 10.1 — Nonconformity & corrective action", "Clause 10.2 — Continual improvement"]

  - id: org
    iso_layer: "27001"
    label: "Organizational (A.5)"
    items:
      - id: o-access-policy
        q: "Do you control who can access what, and review access regularly?"
        controls: ["A.5.15 — Access control", "A.5.16 — Identity management", "A.5.18 — Access rights"]
      - id: o-suppliers
        q: "Do you assess and monitor the security of your suppliers?"
        controls: ["A.5.19 — Supplier relationships", "A.5.20 — Addressing security in agreements", "A.5.21 — ICT supply chain", "A.5.22 — Monitoring supplier services"]
      - id: o-incident
        q: "Do you have an incident response process people actually follow?"
        controls: ["A.5.24 — Incident management planning", "A.5.25 — Assessment of events", "A.5.26 — Response to incidents", "A.5.27 — Learning from incidents", "A.5.28 — Evidence collection"]
      - id: o-continuity
        q: "Do you have business continuity / ICT readiness plans?"
        controls: ["A.5.29 — Security during disruption", "A.5.30 — ICT readiness for continuity"]
      - id: o-classification
        q: "Is information classified and handled per its sensitivity?"
        controls: ["A.5.9 — Inventory of assets", "A.5.10 — Acceptable use", "A.5.11 — Return of assets", "A.5.12 — Classification", "A.5.13 — Labelling", "A.5.14 — Information transfer"]
      - id: o-legal
        q: "Do you track legal, regulatory and contractual security obligations?"
        controls: ["A.5.31 — Legal & contractual requirements", "A.5.32 — Intellectual property", "A.5.33 — Protection of records", "A.5.34 — Privacy & PII", "A.5.36 — Compliance with policies", "A.5.37 — Documented operating procedures"]
      # AUTHORING: ensure A.5.3–A.5.8, A.5.17, A.5.23, A.5.35 are also represented
      # across the items above (add items or extend `controls`) — see Step 2.

  - id: people
    iso_layer: "27001"
    label: "People (A.6)"
    items:
      - id: pe-screening
        q: "Do you screen new hires and set security terms in contracts?"
        controls: ["A.6.1 — Screening", "A.6.2 — Terms & conditions of employment"]
      - id: pe-awareness
        q: "Do staff get security awareness training, with a disciplinary process for breaches?"
        controls: ["A.6.3 — Awareness, education & training", "A.6.4 — Disciplinary process"]
      - id: pe-offboarding
        q: "Do you handle responsibilities after employment ends, and have NDAs?"
        controls: ["A.6.5 — Responsibilities after termination", "A.6.6 — Confidentiality / NDAs"]
      - id: pe-remote
        q: "Do you have remote-working and event-reporting rules?"
        controls: ["A.6.7 — Remote working", "A.6.8 — Information security event reporting"]

  - id: physical
    iso_layer: "27001"
    label: "Physical (A.7)"
    items:
      - id: ph-perimeter
        q: "Are your premises physically secured and access-controlled?"
        controls: ["A.7.1 — Physical security perimeters", "A.7.2 — Physical entry", "A.7.3 — Securing offices & facilities", "A.7.4 — Physical security monitoring"]
      - id: ph-environment
        q: "Are facilities protected against environmental and utility threats?"
        controls: ["A.7.5 — Protecting against physical & environmental threats", "A.7.8 — Equipment siting", "A.7.11 — Supporting utilities", "A.7.12 — Cabling security"]
      - id: ph-equipment
        q: "Are devices, media and equipment protected, maintained and securely disposed of?"
        controls: ["A.7.6 — Working in secure areas", "A.7.7 — Clear desk & clear screen", "A.7.9 — Security of assets off-premises", "A.7.10 — Storage media", "A.7.13 — Equipment maintenance", "A.7.14 — Secure disposal or re-use"]

  - id: tech
    iso_layer: "27001"
    label: "Technological (A.8)"
    items:
      - id: t-endpoint
        q: "Are user endpoints, privileged access and authentication controlled?"
        controls: ["A.8.1 — User endpoint devices", "A.8.2 — Privileged access rights", "A.8.3 — Information access restriction", "A.8.5 — Secure authentication"]
      - id: t-malware-vuln
        q: "Do you run malware protection and manage technical vulnerabilities/patching?"
        controls: ["A.8.7 — Protection against malware", "A.8.8 — Management of technical vulnerabilities", "A.8.19 — Software on operational systems"]
      - id: t-backup-logging
        q: "Do you take backups and keep monitored logs?"
        controls: ["A.8.13 — Information backup", "A.8.15 — Logging", "A.8.16 — Monitoring activities", "A.8.17 — Clock synchronisation", "A.8.6 — Capacity management"]
      - id: t-crypto-network
        q: "Do you use encryption and segregate/secure your networks?"
        controls: ["A.8.24 — Use of cryptography", "A.8.20 — Networks security", "A.8.21 — Security of network services", "A.8.22 — Segregation of networks", "A.8.23 — Web filtering", "A.8.12 — Data leakage prevention"]
      - id: t-secure-dev
        q: "Do you build software securely (SDLC, testing, change control)?"
        controls: ["A.8.25 — Secure development lifecycle", "A.8.26 — Application security requirements", "A.8.27 — Secure system architecture", "A.8.28 — Secure coding", "A.8.29 — Security testing", "A.8.30 — Outsourced development", "A.8.31 — Separation of environments", "A.8.32 — Change management", "A.8.33 — Test information"]
      # AUTHORING: ensure A.8.4, A.8.9, A.8.10, A.8.11, A.8.14, A.8.18, A.8.34
      # are represented across the items above — see Step 2.

  - id: iso42001
    iso_layer: "42001"
    label: "AI Governance (ISO 42001)"
    items:
      - id: ai-impact
        q: "Do you run AI impact assessments on people, groups and society?"
        controls: ["ISO 42001 — AI system impact assessment"]
      - id: ai-bias
        q: "Do you detect, measure and mitigate algorithmic bias?"
        controls: ["ISO 42001 — Fairness & bias controls"]
      - id: ai-explain
        q: "Can you explain why a model made a decision, to those who need it?"
        controls: ["ISO 42001 — Transparency & explainability"]
      - id: ai-oversight
        q: "Do humans stay meaningfully in the loop on AI-driven decisions?"
        controls: ["ISO 42001 — Human oversight"]
      - id: ai-data-gov
        q: "Do you govern training-data quality, provenance and validation?"
        controls: ["ISO 42001 — AI data governance"]
      - id: ai-lifecycle
        q: "Do you version, monitor and retire models as managed artefacts?"
        controls: ["ISO 42001 — Model lifecycle management"]
```

- [ ] **Step 2: Complete and verify full ISO 27001 control coverage**

Edit the `org` and `tech` themes so that **every** Annex A control ID appears in some item's `controls` list (add items or extend existing `controls`). Required ID coverage:

- A.5.1 – A.5.37 (Organizational, 37 controls)
- A.6.1 – A.6.8 (People, 8)
- A.7.1 – A.7.14 (Physical, 14)
- A.8.1 – A.8.34 (Technological, 34)

Then verify coverage with this one-off check (no new dependency; uses the YAML-as-text):

Run:
```bash
node -e "const fs=require('fs');const t=fs.readFileSync('_data/iso-assessment.yml','utf8');const want=[];const add=(p,n)=>{for(let i=1;i<=n;i++)want.push(p+i)};add('A.5.',37);add('A.6.',8);add('A.7.',14);add('A.8.',34);const missing=want.filter(id=>!t.includes(id+' ')&&!t.includes(id+'\"')&&!t.includes(id+','));console.log(missing.length?'MISSING: '+missing.join(', '):'OK: all 93 Annex A controls referenced')"
```
Expected: `OK: all 93 Annex A controls referenced`. If it lists MISSING ids, add them and re-run.

- [ ] **Step 3: Verify the data parses and the version hash is stable**

Run:
```bash
node -e "const fs=require('fs');const s=require('./src/js/iso-assessment/scoring.js');const yaml=fs.readFileSync('_data/iso-assessment.yml','utf8');console.log('parses via jekyll at build; ids:',(yaml.match(/^\s{6}- id:/gm)||[]).length,'items')"
```
Expected: prints a count of item lines (sanity check; the real YAML→JSON happens at Jekyll build, verified in Task 6).

- [ ] **Step 4: Commit**

```bash
git add _data/iso-assessment.yml
git commit -m "feat: add ISO 27001/42001 assessment content"
```

---

## Task 5: Assessment entry (DOM, state, persistence)

**Files:**
- Create: `src/js/iso-assessment.js`

Renders the UI once, then patches only the results panel + N/A classes on change (preserves `<details>` open state). Persists to versioned `localStorage`.

- [ ] **Step 1: Write the entry module**

Create `src/js/iso-assessment.js`:

```js
const scoring = require('./iso-assessment/scoring.js')

const STORE_KEY = 'iso-assessment'

function esc(s) {
  return String(s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

function band(percent) {
  if (percent >= 85) return 'Audit-ready-ish'
  if (percent >= 60) return 'Foundations in place'
  if (percent >= 30) return 'Getting started'
  return 'Early days'
}

function readData() {
  const el = document.getElementById('assessment-data')
  if (!el) return null
  try { return JSON.parse(el.textContent) } catch (e) { return null }
}

function loadState(version) {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return { profile: {}, checks: {}, reset: false }
    const p = JSON.parse(raw)
    if (p && p.version === version) {
      return { profile: p.profile || {}, checks: p.checks || {}, reset: false }
    }
    return { profile: {}, checks: {}, reset: true } // stale schema -> drop
  } catch (e) {
    return { profile: {}, checks: {}, reset: false }
  }
}

function saveState(version, profile, checks) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ version, profile, checks }))
  } catch (e) { /* private mode / quota — assessment still works in-memory */ }
}

function profileHTML(data, profile) {
  const rows = data.profile.map(q => {
    const v = profile[q.id]
    return `<div class="ia-profile-q">
      <span>${esc(q.q)}</span>
      <span class="ia-toggle">
        <label><input type="radio" name="prof-${esc(q.id)}" data-prof="${esc(q.id)}" value="yes"${v === true ? ' checked' : ''}><span>Yes</span></label>
        <label><input type="radio" name="prof-${esc(q.id)}" data-prof="${esc(q.id)}" value="no"${v === false ? ' checked' : ''}><span>No</span></label>
      </span>
    </div>`
  }).join('')
  return `<section class="ia-panel">
    <h2>1 · Your profile</h2>
    <p class="ia-panel-sub">Answers mark whole areas Not Applicable, so you're only scored on what's relevant — like a Statement of Applicability.</p>
    ${rows}
  </section>`
}

function themeHTML(theme, checks) {
  const items = theme.items.map(item => {
    const controls = (item.controls || []).map(c => `<li>${esc(c)}</li>`).join('')
    return `<div class="ia-item">
      <label><input type="checkbox" data-item="${esc(item.id)}"${checks[item.id] ? ' checked' : ''}><span>${esc(item.q)}</span></label>
      <details><summary>Controls covered</summary><ul>${controls}</ul></details>
    </div>`
  }).join('')
  return `<section class="ia-theme" data-theme-id="${esc(theme.id)}" data-layer="${esc(theme.iso_layer)}">
    <div class="ia-theme-head"><h3>${esc(theme.label)}</h3><span class="ia-na-badge">Not applicable</span></div>
    ${items}
  </section>`
}

function controlsHTML(data, checks) {
  const opts = ['<option value="all">All areas</option>']
    .concat(data.themes.map(t => `<option value="${esc(t.id)}">${esc(t.label)}</option>`))
    .join('')
  const themes = data.themes.map(t => themeHTML(t, checks)).join('')
  return `<section class="ia-panel">
    <h2>2 · Work through the areas</h2>
    <p class="ia-panel-sub">Tick what you genuinely have in place. Expand any question to see the ISO controls it covers.</p>
    <div class="ia-toolbar">
      <label for="ia-filter">Filter:</label>
      <select id="ia-filter">${opts}</select>
    </div>
    ${themes}
  </section>`
}

function bar(t) {
  const pct = t.percent == null ? 0 : t.percent
  const label = t.percent == null ? 'n/a' : t.percent + '%'
  return `<div class="ia-bar">
    <div class="ia-bar-label"><span>${esc(t.label)}</span><span>${label} <small>(${t.checked}/${t.total})</small></span></div>
    <div class="ia-bar-track"><div class="ia-bar-fill" style="width:${pct}%"></div></div>
  </div>`
}

function resultsHTML(data, checks, naThemes, aiUnlocked) {
  const core = scoring.computeScore(data, checks, naThemes, '27001')
  const ai = scoring.computeScore(data, checks, naThemes, '42001')
  const progress = scoring.themeProgress(data, checks, naThemes)
  const gaps = scoring.computeGaps(data, checks, naThemes)

  const scoreBlock = core == null
    ? `<p>No applicable controls — adjust your profile above.</p>`
    : `<div class="ia-score"><b>${core.percent}%</b><span class="ia-band">${esc(band(core.percent))}</span></div>
       <p class="ia-disclaimer">Rough self-assessment — not a certification. Based on ${core.checked}/${core.total} applicable items.</p>`

  const aiBlock = (aiUnlocked && ai != null)
    ? `<p class="ia-subscore"><b>AI governance (ISO 42001): ${ai.percent}%</b> — ${ai.checked}/${ai.total} items, scored separately from your 27001 result.</p>`
    : ''

  const bars = progress.map(bar).join('')

  const gapBlock = gaps.length
    ? `<div class="ia-gaps"><h3>Your gaps</h3>` + gaps.map(g =>
        `<h3>${esc(g.theme)}</h3><ul>${g.items.map(i => `<li>${esc(i.q)}</li>`).join('')}</ul>`
      ).join('') + `</div>`
    : `<p>No gaps in your applicable areas — nicely done.</p>`

  return `<section class="ia-panel">
    <h2>3 · Where you stand</h2>
    ${scoreBlock}
    ${aiBlock}
    ${bars}
    ${gapBlock}
    <div class="ia-cta">
      <p>Want help closing these gaps? I get teams to <em>aligned</em> — the state you need before certification.
      See <a href="/ai-security-review/">AI security review</a> and <a href="/ai-build/">AI build</a>.</p>
    </div>
  </section>`
}

function readProfileFromDom(root) {
  const profile = {}
  root.querySelectorAll('input[data-prof]:checked').forEach(el => {
    profile[el.getAttribute('data-prof')] = el.value === 'yes'
  })
  return profile
}

function readChecksFromDom(root) {
  const checks = {}
  root.querySelectorAll('input[data-item]').forEach(el => {
    if (el.checked) checks[el.getAttribute('data-item')] = true
  })
  return checks
}

function applyNaClasses(root, naThemes) {
  root.querySelectorAll('.ia-theme').forEach(sec => {
    const id = sec.getAttribute('data-theme-id')
    sec.classList.toggle('is-na', naThemes.has(id))
  })
}

function applyFilter(root, value) {
  root.querySelectorAll('.ia-theme').forEach(sec => {
    const id = sec.getAttribute('data-theme-id')
    sec.classList.toggle('is-hidden', value !== 'all' && id !== value)
  })
}

function init() {
  const root = document.getElementById('iso-assessment')
  if (!root) return
  const data = readData()
  if (!data) { root.innerHTML = '<p>Could not load the assessment data.</p>'; return }

  const version = scoring.schemaVersion(data)
  const state = loadState(version)

  const resetNotice = state.reset
    ? `<div class="ia-reset">The assessment was updated since your last visit — your previous progress has been reset.</div>`
    : ''

  root.innerHTML = resetNotice
    + profileHTML(data, state.profile)
    + controlsHTML(data, state.checks)
    + `<div id="ia-results"></div>`

  const resultsEl = root.querySelector('#ia-results')

  function update() {
    const profile = readProfileFromDom(root)
    const { naThemes, aiUnlocked } = scoring.resolveApplicability(data, profile)
    // The 42001 theme stays in the DOM but is hidden until unlocked.
    root.querySelectorAll('.ia-theme[data-layer="42001"]').forEach(sec => {
      sec.classList.toggle('is-hidden', !aiUnlocked)
    })
    applyNaClasses(root, naThemes)
    const checks = readChecksFromDom(root)
    resultsEl.innerHTML = resultsHTML(data, checks, naThemes, aiUnlocked)
    saveState(version, profile, checks)
  }

  root.addEventListener('change', e => {
    if (e.target.id === 'ia-filter') { applyFilter(root, e.target.value); return }
    if (e.target.matches('input[data-prof], input[data-item]')) update()
  })

  update()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
```

- [ ] **Step 2: Build the assets and confirm the bundle is produced**

Run: `npm run build:assets`
Expected: PASS — esbuild logs `✅ Assessment JS built` and sass compiles; `assets/js/iso-assessment.min.js` and `assets/css/iso-assessment.min.css` exist.

Verify:
```bash
test -f assets/js/iso-assessment.min.js && test -f assets/css/iso-assessment.min.css && echo "bundles present"
```
Expected: `bundles present`.

- [ ] **Step 3: Confirm no `MainApp` global leaked into the assessment bundle**

Run:
```bash
grep -c "var MainApp" assets/js/iso-assessment.min.js || true
```
Expected: `0` (the separate build config has no `globalName`).

- [ ] **Step 4: Re-run the scoring unit tests (regression)**

Run: `node --test src/js/iso-assessment/`
Expected: PASS — 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/js/iso-assessment.js assets/js/iso-assessment.min.js assets/css/iso-assessment.min.css
git commit -m "feat: add iso-assessment interactive entry"
```

---

## Task 6: The page

**Files:**
- Create: `tools/iso-27001-self-assessment.md`

- [ ] **Step 1: Create the page**

Create `tools/iso-27001-self-assessment.md`:

```liquid
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
{{ site.data.iso-assessment | jsonify }}
</script>

<div id="iso-assessment"></div>
```

- [ ] **Step 2: Build the site and verify the page + data blob render**

Run: `npm run build`
Expected: Jekyll build succeeds. (On this Guix system, if `bundle` is not on PATH, run via the project's normal Jekyll toolchain, e.g. `guix shell ruby ruby-jekyll -- bundle exec jekyll build`, or whatever the user uses for `deploy.sh`.)

Verify the page and embedded JSON exist:
```bash
test -f _site/tools/iso-27001-self-assessment/index.html && \
grep -q 'id="assessment-data"' _site/tools/iso-27001-self-assessment/index.html && \
grep -q '"themes"' _site/tools/iso-27001-self-assessment/index.html && \
echo "page + data blob OK"
```
Expected: `page + data blob OK`.

- [ ] **Step 3: Confirm the conditional bundle flag is the only thing left**

At this point the page builds but does NOT yet load the JS/CSS (the includes change is Task 7). Confirm the flag is present:
```bash
grep -q "js_assessment: true" tools/iso-27001-self-assessment.md && echo "flag set"
```
Expected: `flag set`.

- [ ] **Step 4: Commit**

```bash
git add tools/iso-27001-self-assessment.md
git commit -m "feat: add ISO 27001 self-assessment page"
```

---

## Task 7: Conditional asset loading

**Files:**
- Modify: `_includes/header.html` (CSS link, near line 52)
- Modify: `_includes/footer.html` (JS script, near line 5)

- [ ] **Step 1: Add the conditional CSS link**

In `_includes/header.html`, immediately after the line:
```liquid
  <link href="/assets/css/main.min.css" rel="stylesheet">
```
add:
```liquid
  {% if page.js_assessment %}<link href="/assets/css/iso-assessment.min.css" rel="stylesheet">{% endif %}
```

- [ ] **Step 2: Add the conditional JS script**

In `_includes/footer.html`, immediately after the mermaid conditional block (the `{% if ... %}...mermaid.min.js...{% endif %}` near line 3–5), add:
```liquid
{% if page.js_assessment %}<script src="/assets/js/iso-assessment.min.js"></script>{% endif %}
```

- [ ] **Step 3: Rebuild and verify the bundles are now referenced on the page only**

Run: `npm run build`
Then:
```bash
grep -q "iso-assessment.min.css" _site/tools/iso-27001-self-assessment/index.html && \
grep -q "iso-assessment.min.js" _site/tools/iso-27001-self-assessment/index.html && \
echo "tool page references bundles"
# And confirm an unrelated page does NOT reference them:
! grep -q "iso-assessment.min" _site/about/index.html && echo "other pages clean"
```
Expected: `tool page references bundles` and `other pages clean`.

- [ ] **Step 4: Commit**

```bash
git add _includes/header.html _includes/footer.html
git commit -m "feat: conditionally load iso-assessment bundles"
```

---

## Task 8: Blog post call-out

**Files:**
- Modify: `src/scss/custom.scss` (add a site-wide `.fil-callout`)
- Modify: `_posts/2026/2026-04-23-iso-27001-42001-what-aligned-actually-means.md`

The post renders with `main.min.css` (not the tool bundle), so the callout style lives in `custom.scss`.

- [ ] **Step 1: Add the callout style**

In `src/scss/custom.scss`, inside the `body.fil { ... }` block (so it uses the in-scope tokens), add near the other `.fil-` component rules:

```scss
  .fil-callout {
    border: 1px solid var(--fil-line-2);
    border-left: 4px solid var(--fil-accent);
    background: var(--fil-glow-p);
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin: 2rem 0;
    p { margin: 0 0 .5rem; }
    p:last-child { margin: 0; }
    .fil-callout-cta {
      font-weight: 700;
    }
  }
```

- [ ] **Step 2: Insert the call-out into the post**

In `_posts/2026/2026-04-23-iso-27001-42001-what-aligned-actually-means.md`, immediately **before** the `## How I help` heading (line ~106), insert:

```html
<div class="fil-callout" markdown="1">
**Curious where you stand right now?** I built a quick, plain-terms self-assessment
— profile your business, work through the controls, get a rough alignment score
(and the gaps worth tackling first). It's not a certification, just an honest read.

<span class="fil-callout-cta">→ [Take the ISO 27001 self-assessment](/tools/iso-27001-self-assessment/)</span>
</div>
```

- [ ] **Step 3: Rebuild and verify the link resolves**

Run: `npm run build`
Then:
```bash
grep -q "/tools/iso-27001-self-assessment/" _site/blog/iso-27001-42001-what-aligned-actually-means/index.html && \
echo "callout links to tool"
```
Expected: `callout links to tool`.

- [ ] **Step 4: Commit**

```bash
git add src/scss/custom.scss _posts/2026/2026-04-23-iso-27001-42001-what-aligned-actually-means.md
git commit -m "feat: link self-assessment from ISO blog post"
```

---

## Task 9: CHANGELOG

**Files:**
- Modify: `CHANGELOG.md` (create if absent, following the minimal format in user conventions)

- [ ] **Step 1: Add an entry**

If `CHANGELOG.md` exists, add under a new dated section; otherwise create it:

```markdown
## [Unreleased]

### Added
- Interactive ISO 27001 / 42001 self-assessment tool at `/tools/iso-27001-self-assessment/`
- Call-out to the tool from the ISO 27001/42001 blog post
```

- [ ] **Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: changelog for ISO self-assessment tool"
```

---

## Task 10: Final automated verification

- [ ] **Step 1: Unit tests green**

Run: `node --test src/js/iso-assessment/`
Expected: PASS, 7 tests, 0 failures.

- [ ] **Step 2: Control coverage complete**

Run the coverage check from Task 4 Step 2.
Expected: `OK: all 93 Annex A controls referenced`.

- [ ] **Step 3: Full build clean**

Run: `npm run build`
Expected: assets build (`✅ Assessment JS built`) and Jekyll build both succeed with no errors.

- [ ] **Step 4: Bundles wired to the right page only**

Run:
```bash
grep -q "iso-assessment.min.js" _site/tools/iso-27001-self-assessment/index.html && \
! grep -q "iso-assessment.min" _site/index.html && echo "wiring OK"
```
Expected: `wiring OK`.

---

## Task 11: Manual browser verification

Serve the built site (e.g. `bundle exec jekyll serve` or the user's usual preview) and open `/tools/iso-27001-self-assessment/`. Confirm each:

- [ ] Page loads; profile, areas, and a results panel all render.
- [ ] **42001 hidden by default:** the "AI Governance (ISO 42001)" area is not shown until the AI profile question is set to **Yes**; setting it to Yes reveals the area and a separate AI sub-score appears in results.
- [ ] **Applicability:** answering **No** to "physical offices" greys out the Physical area, marks it "Not applicable", and the score denominator drops (physical items no longer counted).
- [ ] **Scoring:** ticking items raises the percentage and per-theme bars; the band label changes across thresholds (30/60/85).
- [ ] **Gaps:** unchecked applicable items appear under "Your gaps", grouped by area; checking them removes them.
- [ ] **Expand:** each question's "Controls covered" expands to its ISO control list and stays open when you tick other boxes (no full re-render).
- [ ] **Filter:** the Filter dropdown narrows the visible areas; "All areas" restores them.
- [ ] **Persistence:** tick some items, reload — state is restored.
- [ ] **Schema reset:** in devtools, set `localStorage['iso-assessment']` to `{"version":"stale","profile":{},"checks":{}}` and reload — progress resets and the reset notice shows once.
- [ ] **No-JS:** with JS disabled, the `<noscript>` disclaimer shows and nothing is broken.
- [ ] **Theme:** toggle the site dark/light theme — the tool's colours follow (uses `--fil-*` tokens).
- [ ] **Blog callout:** open the post, confirm the call-out renders styled and links to the tool.

When all boxes are checked, the feature is complete.

---

## Self-review notes (author)

- **Spec coverage:** two-tier complete coverage (Task 4 + coverage check), dedicated `/tools/` page (Task 6), profile applicability + theme filter (Tasks 4–5), 42001 optional layer w/ separate sub-score (Tasks 1,4,5,11), client-side + versioned localStorage + no backend (Task 5), percentage + per-theme bars + theme-grouped gaps, no weighting (Tasks 1,5), disclaimer + noscript (Task 6), soft CTA (Task 5), blog call-out (Task 8). Print/export intentionally omitted (YAGNI, per spec).
- **No weighting:** confirmed — `scoring.js` has no weight field; gaps are document-order grouped.
- **Type consistency:** `resolveApplicability` returns `{ naThemes, aiUnlocked }`; `computeScore(data, checks, naThemes, layer)`; `computeGaps`/`themeProgress(data, checks, naThemes)` — used consistently in `iso-assessment.js`.
- **Build isolation:** separate `assessmentConfig` (no `globalName`) verified in Task 5 Step 3.
```
