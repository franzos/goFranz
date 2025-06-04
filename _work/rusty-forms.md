---
layout: page
title: "Formshive"
date: 2024-06-16 00:00:00 +0100
client: "independent_lisbon"
cover: rusty-forms-01.jpg
bg: switzerland
tags: "web development"
introduction: "Formshive: Form handling in Rust"
featured: true
---

Formshive (foremerly Rusty Forms) is a (form-) data processing platform, written in Rust.

## The challenge

Getting tired having to submit to other companies, to process my web forms, I decided to write my own; Goals include:

- Better spam handling (more flexibility!)
- More privacy for me, and my users (no recaptcha, no tracking)
- No nonsense limits (Pro plan, Plus plan, blah blah blah ..)
- Quick: Pre-define forms (for validation), or not
- Nostr integration (well, Nostr-powered login anyways)

### Background

Years ago I started with Wufoo which was simple enough; Then I decided to self-host and setup a Form Tools instance for me and my clients. This was working well for a while, until it was overrun with spam... Initialy it was managable because I could play with honeypots and basic filters, but there was no way to actually "detect" spam, so most of it went straight trough.
Then I discovered Formspree. That worked well until they grew too large and complicated - more plans, more stuff locked-away, and messages you can't read because they were received 31 days ago and you're not on the professional plan.

### Implementation

It's all fairly simple, which was the goal:

- The backend is written in Rust, with Actix and diesel
- Trained my own spam filter, using a simple Naive Bayes classifier
- Frontend is vite/react

I considered doing the front-end in plain html, but a little react interactivity is nice and saves some time.

{% include project-image.html image="rusty-forms-01.png" %}
{% include project-image.html image="rusty-forms-02.png" %}

## Thoughts

Formshive is already live: [formshive.com](https://formshive.com/).

With a sufficiently large data set, the spam check turns out to be the most ressource intensive part of the system. At the moment the server can handle approx. 27k messages, with spam check (millions without). Once load increases, I'll probably split the spam check into a separate service.