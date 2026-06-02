# Recipes Section — Design Spec

**Date:** 2026-06-02
**Status:** Approved for planning

## Goal

Add a cooking-recipes section to gofranz.com at `/cooking/recipes/`. It keeps the shared goFranz header, footer, and Overpass type, but wears its own warm, Eastern-Mediterranean "Souk" skin — distinct from the purple Filament homepage. Both the listing page and individual recipe pages get the treatment. The section is not linked into the main nav yet.

## Decisions (locked)

- **URL:** `/cooking/recipes/` for the index; `/cooking/recipes/:title/` for each recipe (changed from the current `/recipes/:title/`).
- **Scope:** listing page **and** recipe detail pages both restyled.
- **Imagery:** photo-ready, with a graceful fallback — cards/headers have an optional photo slot that degrades to a colored **zellige tile + food glyph** when no image exists.
- **Visual direction:** "The Souk" — Levantine zellige tilework. Terracotta, saffron, olive, teal on warm cream.

## Visual System ("Souk" skin)

A scoped palette layered over the existing Filament tokens, applied only under `body.kitchen`. Reuses Overpass / Overpass Mono.

| Token | Value | Use |
|-------|-------|-----|
| `--sk-paper` | `#f4ede0` | page background |
| `--sk-paper2` | `#fffdf8` | card / panel surface |
| `--sk-ink` | `#241d14` | body text |
| `--sk-soft` | `#6f6451` | muted meta text |
| `--sk-terra` | `#b4621f` | primary accent (kickers) |
| `--sk-terra-d` | `#7c2d12` | headlines, active nav |
| `--sk-saffron` | `#d99520` | secondary accent / bullets |
| `--sk-olive` | `#6b7233` | tertiary accent |
| `--sk-teal` | `#1f6f6b` | category labels, links |
| `--sk-line` | `#e0d3bc` | borders / dividers |

**Signature motifs:**
- **Zellige strip** — a thin `repeating-conic-gradient` tile band (terra/saffron/olive/teal) used at the top of the section and as the no-photo card fallback.
- **Woven bar** — a 45° striped terracotta/saffron bar under headlines (the Souk cousin of Filament's solid `.bar`).
- **Tile-badge headings** — `h3` prose headings (Ingredients / Instructions) prefixed with a small tile glyph.
- **Saffron diamond bullets** (`◆`) for the ingredient list; dotted underlines between items.

Dark theme: the section honors the existing theme toggle. The Souk skin defines a dark variant of its tokens (deepened paper, lightened ink/accents) under `[data-bs-theme="dark"] body.kitchen` so it stays legible without fighting the global toggle.

## Routing & Layout Wiring

- **`_config.yml`** — change the `recipes` collection permalink to `/cooking/recipes/:title/`.
- **Body class** — `_layouts/layout.html` appends `kitchen` to the `<body>`/`<main>` class when `page.url contains "/cooking/recipes"` (the same `page.url`-driven pattern the layout already uses for the `/work/` CTA). This is the single hook that activates the Souk skin, and it covers both the index and detail pages without a per-layout flag.
- The shared CTA block in `layout.html` (contact prompt) does **not** appear on recipe URLs — no change needed, recipes aren't in its match list.

## Components / Files

**New:**
- `_layouts/recipe.html` — detail-page layout (Filament-based, `kitchen: true`). Renders: kicker (`cuisine · method`), title, woven bar, intro/summary, a **meta strip** (Serves / Active / Total / Cuisine), then `fil-prose` content. Optional hero image above the header when `page.image` is set; otherwise no hero (the section reads as type-forward).
- `cooking/recipes.html` — the listing page (`layout: layout`, `kitchen: true`). Renders the hero (kicker, "Recipes" title, woven bar, lede), optional filter chips, and the card grid by iterating `site.recipes | sort: "date" | reverse`.
- `_includes/recipe-card.html` — one card: photo-or-tile thumb, `cuisine · method` category, title, spice/tag chips, meta row (`serves`, highlight). Reused by the listing (and available for any "related recipes" use later).
- `src/scss/_recipes.scss` — all Souk styles, scoped under `body.kitchen`. Imported by `src/scss/main.scss` immediately after `@import "custom";`.
- `assets/images/recipes/` — directory for optional recipe photos (git-tracked; the broad `assets/images/projects/preview/` ignore does not cover it).

**Modified:**
- `_config.yml` — permalink change (above).
- `_layouts/layout.html` — body-class `kitchen` hook (above).
- `src/scss/main.scss` — add `@import "recipes";`.
- The three existing recipes in `_recipes/` — switch `layout: page` → `layout: recipe` and add the new front-matter fields (below).

## Recipe Front-Matter Schema

Existing recipes only carry `title`, `layout`, `sitemap`, `date`, `author`. The section adds:

```yaml
---
title: "Oven-Baked Greek Lemon Chicken with Potatoes"
layout: recipe          # was: page
date: 2026-05-30 0:00:00 +0000
author: Franz Geffke
sitemap: false
cuisine: "Greek"        # kicker + filter facet
method: "Oven-baked"    # second half of the kicker (e.g. "One-pan", "Oven")
serves: 4               # meta strip
time_active: "20 min"   # meta strip
time_total: "1h 20m"    # meta strip
summary: "Crispy-skinned thighs and golden potatoes in lemon, garlic and oregano — Sunday food that mostly cooks itself."  # card blurb + detail intro
tags: [lemon, garlic, oregano]   # spice/ingredient chips + filter facets
highlight: "Sunday"     # optional ★ label on the card
glyph: "🍋"             # optional emoji for the no-photo tile (default 🍽)
image: /assets/images/recipes/greek-lemon-chicken.jpg   # optional; omit for tile fallback
---
```

All new fields are optional except where a sensible default exists: `method` defaults to empty (kicker shows just cuisine), `glyph` defaults to a generic plate, `summary` falls back to the recipe's first paragraph if absent. Card and meta-strip rows render conditionally so partial metadata never breaks the layout.

## Filters (progressive enhancement)

The listing shows cuisine/facet chips ("All", plus distinct `cuisine` values and selected `tags`). Filtering is a small vanilla-JS layer in `src/js/main.js`: clicking a chip toggles `hidden` on non-matching cards via a `data-facets` attribute on each card. With JS disabled, all cards show and chips are inert — no functionality lost. Given only three recipes today this is deliberately lightweight; it can be dropped without affecting anything else.

## Data Flow

Jekyll builds `site.recipes` from the `_recipes/` collection. The listing page iterates them (newest first) into `recipe-card.html`. Each recipe page renders through `recipe.html`. SCSS compiles via the existing `sass` step in `esbuild.config.js` (no new build target — the partial rides on `main.min.css`). The Souk skin activates purely through the `body.kitchen` class; nothing leaks to the rest of the site because every rule is nested under it.

## Error / Edge Handling

- **No image** → zellige-tile fallback with `glyph`.
- **Missing meta fields** → those rows/chips omitted; layout holds.
- **No `summary`** → first paragraph used for the card blurb.
- **Empty collection** → listing shows the hero and a quiet "no recipes yet" line (defensive; not expected).

## Verification

- `bundle exec jekyll build` succeeds; `/cooking/recipes/` and each `/cooking/recipes/<slug>/` render.
- Cards show tile fallback (recipes 1 & 3) and a photo where provided.
- Light and dark themes both legible.
- Header/footer/nav identical to the rest of the site; theme toggle works.
- No style bleed onto non-kitchen pages (spot-check homepage + a blog post).
- Filter chips toggle cards; all cards visible with JS off.

## Out of Scope (YAGNI)

- Linking the section into the main nav (explicitly deferred).
- Per-cuisine landing pages / tag archive pages.
- Print stylesheet tuning for recipes.
- Search, ratings, comments, print-to-PDF, "jump to recipe" anchors, scaling/serving calculators.
- Recipe JSON-LD schema (can be added later if SEO matters).
