---
layout: post
title:  "Bolt CMS: Filter entries by category"
date:   2015-04-11 08:00:00
summary: "Bolt CMS makes it easy to filter entries by category."
categories: PHP, "Bolt CMS"
category:
  - dev
tags:
  - development
  - cms
version: 2.1.4
packages: PHP, Twig
source:
sourcetitle:
---

Bolt CMS makes it easy to filter entries by category. Here's how:

<script src="https://gist.github.com/franzos/13a7eb4ec60990c00447.js"></script>

Let's have a closer look at the individual elements and what they so.

- **blog** # is where you're getting the entries from (contenttypes.yml)
- **latest** # well, yeah. We want the latest entries!
- **10** # number of entries you'd like to show, assuming you have that many
- **where** # serves as a condition
- **entry_categories** # the group of categories we're pulling from (taxonomy.yml)
- **Development** # FINALLY set the category you'd like to show
