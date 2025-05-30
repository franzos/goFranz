---
layout: page
title: "Rusty Shops"
date: 2024-06-16 00:00:00 +0100
client: "independent_lisbon"
cover: rusty-shops-01.jpg
bg: switzerland
tags: "web development"
introduction: "Rusty Shops: Shop platform with Rust"
featured: true
---

Rusty Shops is a shop- platform, written in Rust.

## The challenge

There's many fancy, flashy, expensive shop platforms out there; I decided to write my own with the following goals:

- Fewer features, more opinionated
- More privacy for me, and my users (no recaptcha, no tracking)
- No nonsense limits (Pro plan, Plus plan, blah blah blah ..)
- Easily switch between shops, have multiple warehouses, automated taxes
- Nostr integration (well, Nostr-powered login anyways)

### Implementation

It's all fairly simple, which was the goal:

- The backend is written in Rust, with Actix and diesel
- Wrote a couple of libraries, to handle tax, shipping and PDFs
  - Trade documents: [tradedoc](https://crates.io/crates/tradedoc)
  - Sales tax calculation [world-tax](https://crates.io/crates/world-tax)
  - Shipping calculation: _not public yet_
- Frontend is vite/react (+ 2x shop frontends; one react, one vue)

I considered doing the front-end in plain html, but a little react interactivity is nice and saves some time.

{% include project-image.html image="rusty-shops-01.jpg" %}
{% include project-image.html image="rusty-shops-02.png" %}
{% include project-image.html image="rusty-shops-03.png" %}
{% include project-image.html image="rusty-shops-04.png" %}
Frontend written with Vue and NaiveUI: Cart calculation is handled by API

{% include project-image.html image="rusty-shops-05.png" %}
Frontend written in React: Cart calculation happens in web worker

## Thoughts

Rusty Shops is already live: [rusty-shops.com](https://rusty-shops.com/).