# Recipes Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cooking-recipes section at `/cooking/recipes/` with its own warm "Souk" (Eastern-Mediterranean) skin, reusing the shared goFranz header/footer and Overpass type.

**Architecture:** The section folds into the existing Filament layout. A single `body.kitchen` class (added by `_layouts/layout.html` when `page.url contains "/cooking/recipes"`) activates a scoped SCSS partial — so nothing leaks to the rest of the site. A new `recipe` layout renders detail pages; a listing page iterates `site.recipes` through a reusable card include. Cards/headers carry an optional photo slot that degrades to a colored zellige tile.

**Tech Stack:** Jekyll (kramdown/Liquid), SCSS compiled by dart-`sass` via esbuild, vanilla JS, Bootstrap utilities. No unit-test harness — verification is `jekyll build` + grepping rendered `_site` output + a light theme check.

**Build commands (Guix-wrapped, per `deploy.sh`):**
- Assets/CSS: `guix shell node pnpm -- pnpm run build:assets`
- Site: `guix shell ruby@3 make gcc-toolchain -- sh -c "export BUNDLE_PATH=.bundle && bundle exec jekyll build"`

**Reference spec:** `docs/superpowers/specs/2026-06-02-recipes-section-design.md`

---

## File Structure

**Create:**
- `_layouts/recipe.html` — detail-page layout (Filament-based): kicker, title, woven bar, meta strip, prose, "more recipes".
- `_includes/recipe-card.html` — one recipe card (photo-or-tile thumb, kicker, title, chips, meta). Reused by listing + "more recipes".
- `cooking/recipes.html` — listing page (hero + filter chips + card grid) at `/cooking/recipes/`.
- `src/scss/_recipes.scss` — the entire Souk skin, scoped under `body.kitchen`.

**Modify:**
- `_config.yml` — recipes collection permalink → `/cooking/recipes/:title/`.
- `_layouts/layout.html` — add `kitchen` to body/main class when on a recipes URL.
- `src/scss/main.scss` — `@import "recipes";` after `@import "custom";`.
- `src/js/main.js` — append the recipe-filter progressive-enhancement snippet.
- `_recipes/2026-05-22-one-pan-beef-chickpea-bagos-skillet.md`, `_recipes/2026-05-28-one-pan-lebanese-hashweh.md`, `_recipes/2026-05-30-oven-baked-greek-lemon-chicken-with-potatoes.md` — `layout: recipe` + new front-matter fields.

---

## Task 1: Routing + body-class hook + SCSS scaffold

**Files:**
- Modify: `_config.yml`
- Modify: `_layouts/layout.html`
- Create: `src/scss/_recipes.scss`
- Modify: `src/scss/main.scss`

- [ ] **Step 1: Change the recipes permalink in `_config.yml`**

Find:
```yaml
  recipes:
    output: true
    permalink: /recipes/:title/
```
Replace with:
```yaml
  recipes:
    output: true
    permalink: /cooking/recipes/:title/
```

- [ ] **Step 2: Add the `kitchen` body-class hook in `_layouts/layout.html`**

Find:
```liquid
  <body class="bg fil{% if page.layout == "index" %} index{% endif %}">
```
Replace with:
```liquid
  {% assign is_kitchen = false %}{% if page.url contains "/cooking/recipes" %}{% assign is_kitchen = true %}{% endif %}
  <body class="bg fil{% if page.layout == "index" %} index{% endif %}{% if is_kitchen %} kitchen{% endif %}">
```

Find:
```liquid
    <main id="main-content" class="bg fil{% if page.layout == "index" %} index{% endif %}" tabindex="-1">
```
Replace with:
```liquid
    <main id="main-content" class="bg fil{% if page.layout == "index" %} index{% endif %}{% if is_kitchen %} kitchen{% endif %}" tabindex="-1">
```

- [ ] **Step 3: Create `src/scss/_recipes.scss` with a minimal scaffold**

```scss
// Recipes — "Souk" skin. Every rule scoped under body.kitchen so it never
// leaks to the rest of the site.
body.kitchen {
  --sk-paper: #f4ede0;
  --sk-paper2: #fffdf8;
  --sk-ink: #241d14;
  --sk-soft: #6f6451;
  --sk-terra: #b4621f;
  --sk-terra-d: #7c2d12;
  --sk-saffron: #d99520;
  --sk-olive: #6b7233;
  --sk-teal: #1f6f6b;
  --sk-line: #e0d3bc;

  background: var(--sk-paper);
  color: var(--sk-ink);
}
```

- [ ] **Step 4: Import the partial in `src/scss/main.scss`**

Find:
```scss
@import "custom";
@import "theme-icon";
@import "print";
```
Replace with:
```scss
@import "custom";
@import "theme-icon";
@import "recipes";
@import "print";
```

- [ ] **Step 5: Build assets and the site; verify no errors and the class compiles**

Run:
```bash
guix shell node pnpm -- pnpm run build:assets
guix shell ruby@3 make gcc-toolchain -- sh -c "export BUNDLE_PATH=.bundle && bundle exec jekyll build"
```
Expected: both succeed with no Sass/Liquid errors.

Run: `grep -c "body.kitchen" assets/css/main.min.css`
Expected: ≥ 1.

- [ ] **Step 6: Commit**

```bash
git add _config.yml _layouts/layout.html src/scss/_recipes.scss src/scss/main.scss
git commit -m "feat: scaffold recipes section routing and scoped styles"
```

---

## Task 2: Recipe card include

**Files:**
- Create: `_includes/recipe-card.html`

- [ ] **Step 1: Create `_includes/recipe-card.html`**

```liquid
{% assign r = include.recipe %}
{% assign kick = r.cuisine %}
{% if r.cuisine and r.method %}{% assign kick = r.cuisine | append: " · " | append: r.method %}{% elsif r.method %}{% assign kick = r.method %}{% endif %}
{% capture facets %}{% if r.cuisine %}{{ r.cuisine | downcase }}{% endif %}{% if r.method %}|{{ r.method | downcase }}{% endif %}{% for t in r.tags %}|{{ t | downcase }}{% endfor %}{% if r.highlight %}|{{ r.highlight | downcase }}{% endif %}{% endcapture %}
<a class="sk-card" href="{{ r.url }}" data-facets="{{ facets | strip }}">
  {% if r.image %}
  <span class="sk-thumb sk-photo" style="background-image:url('{{ r.image }}')" aria-hidden="true"></span>
  {% else %}
  <span class="sk-thumb sk-tile" aria-hidden="true"><span class="glyph">{{ r.glyph | default: "🍽" }}</span></span>
  {% endif %}
  <span class="sk-cbody">
    {% if kick %}<span class="sk-ccat">{{ kick }}</span>{% endif %}
    <span class="sk-ct">{{ r.title }}</span>
    {% if r.tags %}<span class="sk-chips">{% for t in r.tags %}<span class="sk-chip">{{ t }}</span>{% endfor %}</span>{% endif %}
    {% if r.serves or r.highlight %}<span class="sk-cmeta">{% if r.serves %}<span>SERVES {{ r.serves }}</span>{% endif %}{% if r.highlight %}<span>★ {{ r.highlight | upcase }}</span>{% endif %}</span>{% endif %}
  </span>
</a>
```

(No standalone verification — exercised by Tasks 3 and 4. The card uses inline `<span>`s so it nests validly inside the `<a>`; `_recipes.scss` will set the block display.)

- [ ] **Step 2: Commit**

```bash
git add _includes/recipe-card.html
git commit -m "feat: add recipe card include"
```

---

## Task 3: Recipe detail layout + migrate the three recipes

**Files:**
- Create: `_layouts/recipe.html`
- Modify: `_recipes/2026-05-22-one-pan-beef-chickpea-bagos-skillet.md`
- Modify: `_recipes/2026-05-28-one-pan-lebanese-hashweh.md`
- Modify: `_recipes/2026-05-30-oven-baked-greek-lemon-chicken-with-potatoes.md`

- [ ] **Step 1: Create `_layouts/recipe.html`**

```liquid
---
layout: layout
fil: true
---

<div class="wide fil-article fil-page sk-recipe">
  {% if page.image %}
  <div class="sk-hero-img"><img src="{{ page.image }}" alt="{{ page.title }}"></div>
  {% endif %}

  <header class="fil-art-head sk-rhead">
    {% assign kick = page.cuisine %}
    {% if page.cuisine and page.method %}{% assign kick = page.cuisine | append: " · " | append: page.method %}{% elsif page.method %}{% assign kick = page.method %}{% endif %}
    {% if kick %}<span class="kicker">{{ kick }}</span>{% endif %}
    <span class="bar sk-bar"></span>
    <h1 class="headline">{{ page.title }}</h1>

    {% if page.serves or page.time_active or page.time_total or page.cuisine %}
    <div class="sk-meta">
      {% if page.serves %}<div><span class="k">Serves</span><span class="v">{{ page.serves }}</span></div>{% endif %}
      {% if page.time_active %}<div><span class="k">Active</span><span class="v">{{ page.time_active }}</span></div>{% endif %}
      {% if page.time_total %}<div><span class="k">Total</span><span class="v">{{ page.time_total }}</span></div>{% endif %}
      {% if page.cuisine %}<div><span class="k">Cuisine</span><span class="v">{{ page.cuisine }}</span></div>{% endif %}
    </div>
    {% endif %}
  </header>

  <article class="fil-prose sk-prose">
    {{ content }}
  </article>

  {% assign more = site.recipes | where_exp: "r", "r.url != page.url" | sort: "date" | reverse %}
  {% if more.size > 0 %}
  <section class="sk-more">
    <h2 class="fil-block">More recipes</h2>
    <div class="sk-grid">
      {% for r in more limit: 3 %}{% include recipe-card.html recipe=r %}{% endfor %}
    </div>
  </section>
  {% endif %}
</div>
```

Note: the recipe's existing first paragraph stays as the on-page intro, so `summary` is **not** rendered here (it is card-only) — avoids duplicating the intro.

- [ ] **Step 2: Update front-matter of the beef/chickpea recipe**

In `_recipes/2026-05-22-one-pan-beef-chickpea-bagos-skillet.md`, replace the front-matter block:
```yaml
---
title: "One-Pan Beef, Chickpea & Bagos Skillet"
layout: page
sitemap: false
date: 2026-05-22 0:00:00 +0000
author: Franz Geffke
---
```
with:
```yaml
---
title: "One-Pan Beef, Chickpea & Bagos Skillet"
layout: recipe
sitemap: false
date: 2026-05-22 0:00:00 +0000
author: Franz Geffke
cuisine: "Eastern Mediterranean"
method: "One-pan"
serves: 2
time_active: "30 min"
time_total: "30 min"
summary: "Spiced ground beef, bagos pasta, chickpeas and wilted spinach with feta and lemon — one pan, about 30 minutes."
tags: [cumin, feta, lemon, chickpeas]
highlight: "Weeknight"
glyph: "🥘"
---
```

- [ ] **Step 3: Update front-matter of the Lebanese hashweh recipe**

In `_recipes/2026-05-28-one-pan-lebanese-hashweh.md`, replace the front-matter block:
```yaml
---
title: "One-Pan Lebanese Hashweh"
layout: page
sitemap: false
date: 2026-05-28 0:00:00 +0000
author: Franz Geffke
---
```
with:
```yaml
---
title: "One-Pan Lebanese Hashweh"
layout: recipe
sitemap: false
date: 2026-05-28 0:00:00 +0000
author: Franz Geffke
cuisine: "Lebanese"
method: "One-pan"
serves: 2
time_active: "30 min"
time_total: "30 min"
summary: "A warmly spiced beef-and-rice one-pan dinner with chickpeas and a quiet hit of cinnamon, cumin and allspice."
tags: [cinnamon, allspice, "pine nuts", rice]
highlight: "Comfort"
glyph: "🍚"
---
```

- [ ] **Step 4: Update front-matter of the Greek lemon chicken recipe**

In `_recipes/2026-05-30-oven-baked-greek-lemon-chicken-with-potatoes.md`, replace the front-matter block:
```yaml
---
title: "Oven-Baked Greek Lemon Chicken with Potatoes"
layout: page
sitemap: false
date: 2026-05-30 0:00:00 +0000
author: Franz Geffke
---
```
with:
```yaml
---
title: "Oven-Baked Greek Lemon Chicken with Potatoes"
layout: recipe
sitemap: false
date: 2026-05-30 0:00:00 +0000
author: Franz Geffke
cuisine: "Greek"
method: "Oven-baked"
serves: 2
time_active: "20 min"
time_total: "1h"
summary: "Crispy-skinned chicken thighs and golden potatoes in a lemon, garlic and oregano sauce — almost entirely hands-off."
tags: [lemon, garlic, oregano, potatoes]
highlight: "Sunday"
glyph: "🍋"
---
```

- [ ] **Step 5: Build and verify recipe pages render at the new URLs with the meta strip**

Run:
```bash
guix shell ruby@3 make gcc-toolchain -- sh -c "export BUNDLE_PATH=.bundle && bundle exec jekyll build"
```
Expected: success.

Run: `ls _site/cooking/recipes/`
Expected: directories `one-pan-beef-chickpea-bagos-skillet/`, `one-pan-lebanese-hashweh/`, `oven-baked-greek-lemon-chicken-with-potatoes/`.

Run: `grep -o 'class="sk-meta"' _site/cooking/recipes/oven-baked-greek-lemon-chicken-with-potatoes/index.html | head -1`
Expected: `class="sk-meta"`.

Run: `grep -o "Eastern Mediterranean · One-pan" _site/cooking/recipes/one-pan-beef-chickpea-bagos-skillet/index.html`
Expected: the kicker string prints.

- [ ] **Step 6: Commit**

```bash
git add _layouts/recipe.html _recipes/
git commit -m "feat: add recipe detail layout and recipe metadata"
```

---

## Task 4: Listing page

**Files:**
- Create: `cooking/recipes.html`

- [ ] **Step 1: Create `cooking/recipes.html`**

```liquid
---
layout: layout
fil: true
title: Recipes
sitemap: true
permalink: /cooking/recipes/
description: "A small, growing pile of recipes I actually cook — mostly one-pan, Eastern-Mediterranean leaning."
---

<div class="wide sk-listing">
  <header class="fil-art-head sk-lhead">
    <span class="kicker">goFranz // the kitchen</span>
    <span class="bar sk-bar"></span>
    <h1 class="headline">Recipes</h1>
    <p class="sk-lede">A small, growing pile of things I actually cook — mostly one-pan, Eastern-Mediterranean leaning, written the way I'd explain them to a friend. No life stories before the ingredients.</p>

    {% assign cuisines = site.recipes | map: "cuisine" | compact | uniq | sort %}
    {% if cuisines.size > 1 %}
    <div class="sk-filters" data-recipe-filters>
      <button class="sk-filter on" data-facet="all" type="button">All</button>
      {% for c in cuisines %}<button class="sk-filter" data-facet="{{ c | downcase }}" type="button">{{ c }}</button>{% endfor %}
    </div>
    {% endif %}
  </header>

  {% assign recipes = site.recipes | sort: "date" | reverse %}
  {% if recipes.size > 0 %}
  <div class="sk-grid" data-recipe-grid>
    {% for r in recipes %}{% include recipe-card.html recipe=r %}{% endfor %}
  </div>
  {% else %}
  <p class="sk-empty">No recipes yet — check back soon.</p>
  {% endif %}
</div>
```

- [ ] **Step 2: Build and verify the listing renders all three cards**

Run:
```bash
guix shell ruby@3 make gcc-toolchain -- sh -c "export BUNDLE_PATH=.bundle && bundle exec jekyll build"
```
Expected: success; `_site/cooking/recipes/index.html` exists.

Run: `grep -c 'class="sk-card"' _site/cooking/recipes/index.html`
Expected: `3`.

Run: `grep -o 'class="sk-filter[^"]*"' _site/cooking/recipes/index.html | wc -l`
Expected: `4` (All + Eastern Mediterranean + Greek + Lebanese).

Run: `grep -o 'data-facets="[^"]*"' _site/cooking/recipes/index.html`
Expected: three non-empty `data-facets` strings (e.g. `greek|oven-baked|lemon|garlic|oregano|potatoes|sunday`).

- [ ] **Step 3: Commit**

```bash
git add cooking/recipes.html
git commit -m "feat: add recipes listing page"
```

---

## Task 5: Souk styling (the full skin)

**Files:**
- Modify: `src/scss/_recipes.scss`

- [ ] **Step 1: Replace `src/scss/_recipes.scss` with the full skin**

```scss
// Recipes — "Souk" skin. Every rule scoped under body.kitchen so it never
// leaks to the rest of the site.
body.kitchen {
  --sk-paper: #f4ede0;
  --sk-paper2: #fffdf8;
  --sk-ink: #241d14;
  --sk-soft: #6f6451;
  --sk-terra: #b4621f;
  --sk-terra-d: #7c2d12;
  --sk-saffron: #d99520;
  --sk-olive: #6b7233;
  --sk-teal: #1f6f6b;
  --sk-line: #e0d3bc;

  background: var(--sk-paper);
  color: var(--sk-ink);
}

[data-bs-theme="dark"] body.kitchen {
  --sk-paper: #1c1712;
  --sk-paper2: #241d16;
  --sk-ink: #f0e6d6;
  --sk-soft: #b3a690;
  --sk-terra: #e08542;
  --sk-terra-d: #e8a060;
  --sk-saffron: #e0a93a;
  --sk-olive: #9aa552;
  --sk-teal: #4fb3ac;
  --sk-line: #3a3026;
}

// zellige strip directly under the masthead
main.kitchen {
  position: relative;

  &::before {
    content: "";
    display: block;
    height: 10px;
    background: repeating-conic-gradient(from 0deg at 50% 50%,
      var(--sk-terra) 0 15deg, var(--sk-saffron) 15deg 30deg,
      var(--sk-olive) 30deg 45deg, var(--sk-teal) 45deg 60deg);
    background-size: 24px 24px;
  }
}

body.kitchen {
  .kicker { color: var(--sk-terra) !important; }
  .headline { color: var(--sk-terra-d); }
  a { color: var(--sk-teal); }

  // woven bar — the Souk cousin of Filament's solid .bar
  .sk-bar {
    display: block;
    width: 64px;
    height: 10px;
    margin: 1rem 0 1.2rem;
    background: repeating-linear-gradient(45deg,
      var(--sk-terra) 0 6px, var(--sk-saffron) 6px 12px);
  }

  .sk-lede {
    max-width: 560px;
    font-size: 1.05rem;
    line-height: 1.6;
    color: var(--sk-ink);
  }

  // ---- filter chips ----
  .sk-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 1.4rem;
  }

  .sk-filter {
    font-family: 'Overpass Mono', monospace;
    font-size: .68rem;
    letter-spacing: .06em;
    text-transform: uppercase;
    padding: 6px 13px;
    border-radius: 999px;
    border: 1px solid var(--sk-line);
    background: var(--sk-paper2);
    color: var(--sk-soft);
    cursor: pointer;
    transition: color .12s, background .12s, border-color .12s;

    &:hover { color: var(--sk-terra-d); border-color: var(--sk-terra); }
    &.on { background: var(--sk-terra-d); color: #fff; border-color: var(--sk-terra-d); }
  }

  // ---- grid + cards ----
  .sk-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 22px;
    margin: 2rem 0 1rem;
  }

  .sk-card {
    display: block;
    background: var(--sk-paper2);
    border: 1px solid var(--sk-line);
    border-radius: 12px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: transform .15s, box-shadow .15s;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 34px rgba(36, 24, 12, .16);
    }
  }

  .sk-thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 128px;

    &.sk-tile {
      background: repeating-conic-gradient(from 0deg at 50% 50%,
        var(--sk-terra) 0 15deg, var(--sk-saffron) 15deg 30deg,
        var(--sk-olive) 30deg 45deg, var(--sk-teal) 45deg 60deg);
      background-size: 40px 40px;

      .glyph { font-size: 2rem; filter: drop-shadow(0 1px 3px rgba(0, 0, 0, .4)); }
    }

    &.sk-photo { background-size: cover; background-position: center; }
  }

  .sk-cbody { display: block; padding: 14px 15px 17px; }

  .sk-ccat {
    display: block;
    font-family: 'Overpass Mono', monospace;
    font-size: .6rem;
    letter-spacing: .13em;
    text-transform: uppercase;
    color: var(--sk-teal);
  }

  .sk-ct {
    display: block;
    font-weight: 700;
    font-size: 1.08rem;
    line-height: 1.16;
    margin: .34rem 0 .6rem;
    color: var(--sk-ink);
  }

  .sk-chips { display: flex; flex-wrap: wrap; gap: 6px; }

  .sk-chip {
    font-family: 'Overpass Mono', monospace;
    font-size: .6rem;
    padding: 3px 8px;
    border-radius: 999px;
    background: var(--sk-paper);
    color: var(--sk-terra-d);
    border: 1px solid var(--sk-line);
  }

  .sk-cmeta {
    display: flex;
    gap: 14px;
    margin-top: 11px;
    font-family: 'Overpass Mono', monospace;
    font-size: .6rem;
    letter-spacing: .07em;
    color: var(--sk-soft);
  }

  .sk-empty { color: var(--sk-soft); margin: 2rem 0; }

  // ---- detail page ----
  .sk-hero-img {
    margin-bottom: 1.6rem;
    border-radius: 12px;
    overflow: hidden;
    max-height: 420px;

    img { width: 100%; height: 100%; object-fit: cover; display: block; }
  }

  .sk-meta {
    display: flex;
    flex-wrap: wrap;
    margin: 1.4rem 0 .4rem;
    border-top: 1px solid var(--sk-line);
    border-bottom: 1px solid var(--sk-line);

    div {
      padding: 11px 18px 11px 0;
      margin-right: 18px;
      border-right: 1px solid var(--sk-line);
    }

    div:last-child { border-right: 0; margin-right: 0; }

    .k {
      display: block;
      font-family: 'Overpass Mono', monospace;
      font-size: .58rem;
      letter-spacing: .13em;
      text-transform: uppercase;
      color: var(--sk-soft);
    }

    .v { font-weight: 700; font-size: .98rem; color: var(--sk-ink); }
  }

  // recipe prose: tile-badged section headings + saffron bullets
  .sk-prose {
    h2, h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      color: var(--sk-terra-d);

      &::before {
        content: "";
        width: 22px;
        height: 22px;
        flex: none;
        border-radius: 4px;
        background: repeating-conic-gradient(from 0deg at 50% 50%,
          var(--sk-terra) 0 30deg, var(--sk-saffron) 30deg 60deg);
      }
    }

    ul li::marker { color: var(--sk-saffron); }
  }

  .sk-more {
    margin-top: 3rem;
    padding-top: 1.4rem;
    border-top: 1px solid var(--sk-line);
  }
}
```

- [ ] **Step 2: Compile assets and confirm the skin lands in the bundle**

Run:
```bash
guix shell node pnpm -- pnpm run build:assets
```
Expected: success, no Sass errors.

Run: `grep -c "sk-card\|sk-meta\|repeating-conic-gradient" assets/css/main.min.css`
Expected: ≥ 3.

Run: `grep -c 'data-bs-theme="dark"\] body.kitchen' assets/css/main.min.css`
Expected: ≥ 1 (dark variant present).

- [ ] **Step 3: Visual check in the browser (light + dark)**

Run a local server:
```bash
guix shell ruby@3 make gcc-toolchain -- sh -c "export BUNDLE_PATH=.bundle && bundle exec jekyll serve --port 4010" &
```
Open `http://localhost:4010/cooking/recipes/`. Confirm:
- Zellige strip under the masthead; terracotta "Recipes" title with woven bar.
- Three cards; two show the zellige-tile fallback, layout intact.
- Click a recipe → meta strip (Serves/Active/Total/Cuisine), tile-badged "Ingredients"/"Instructions" headings, "More recipes" grid at the bottom.
- Toggle the theme (ribbon button) → dark variant stays legible.
- Spot-check `http://localhost:4010/` (homepage) and one `/blog/` post → unchanged (no style bleed).

Stop the server when done: `kill %1`.

- [ ] **Step 4: Commit**

```bash
git add src/scss/_recipes.scss
git commit -m "feat: style recipes section with the Souk skin"
```

---

## Task 6: Filter chips (progressive enhancement)

**Files:**
- Modify: `src/js/main.js`

- [ ] **Step 1: Append the filter snippet to the end of `src/js/main.js`**

```js
// Recipe listing filter — progressive enhancement. With JS off, all cards
// show and the chips are inert.
document.addEventListener('DOMContentLoaded', function () {
  var bar = document.querySelector('[data-recipe-filters]');
  var grid = document.querySelector('[data-recipe-grid]');
  if (!bar || !grid) return;

  bar.addEventListener('click', function (e) {
    var btn = e.target.closest('.sk-filter');
    if (!btn) return;
    var facet = btn.getAttribute('data-facet');

    bar.querySelectorAll('.sk-filter').forEach(function (b) {
      b.classList.toggle('on', b === btn);
    });

    grid.querySelectorAll('.sk-card').forEach(function (card) {
      var facets = (card.getAttribute('data-facets') || '').split('|');
      card.hidden = !(facet === 'all' || facets.indexOf(facet) !== -1);
    });
  });
});
```

- [ ] **Step 2: Rebuild assets and confirm the snippet bundled**

Run:
```bash
guix shell node pnpm -- pnpm run build:assets
```
Expected: success.

Run: `grep -c "data-recipe-filters" assets/js/main.min.js`
Expected: ≥ 1.

- [ ] **Step 3: Verify filtering in the browser**

Serve (as in Task 5, Step 3), open `http://localhost:4010/cooking/recipes/`, and confirm:
- Clicking "Greek" hides the two non-Greek cards; "All" shows all three.
- The active chip gets the filled terracotta style.

- [ ] **Step 4: Commit**

```bash
git add src/js/main.js
git commit -m "feat: add client-side recipe cuisine filter"
```

---

## Final Verification

- [ ] **Full build is clean**

Run:
```bash
guix shell node pnpm -- pnpm run build:assets
guix shell ruby@3 make gcc-toolchain -- sh -c "export BUNDLE_PATH=.bundle && bundle exec jekyll build"
```
Expected: both succeed.

- [ ] **Routes exist**

Run: `ls _site/cooking/recipes/ && ls _site/cooking/recipes/*/index.html`
Expected: the listing `index.html` plus three recipe directories.

- [ ] **No style/JS bleed:** homepage and a blog post render unchanged (visual spot-check).
- [ ] **Section is not linked from the main nav** (intentional — `fil-header.html` untouched).
