---
title: "Unofficial Litecoin Roadmap"
layout: post
source:
date: 2017-05-06 08:00:00 +0200
category:
  - crypto
tags:
  - crypto
  - litecoin
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

~~I've come to realize that there's no public roadmap of what's to come over the next couple of months, so I've put together what I've found around the internet as well as on the last, [official roadmap from 2016 (pdf)](/assets/content/2017/litecoin-roadmap-2016.pdf).~~

**Edit**: The official Litecoin roadmap has been published on [litecoincore.org](https://litecoincore.org/).

## Litecoin roadmap 2017 / 2018

<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>What</th>
      <th>Links</th>
    </tr>
  </thead>
  <tbody>
  {% for entry in site.data.unofficial-litecoin-roadmap-2017 %}
  <tr>
    <td>{{ entry.date }}</td>
    <td>{{ entry.news }}</td>
    <td>{% if entry.link1t %}<a href="{{ entry.link1 }}" title="{{ entry.link1t }}">[1]</a>{% endif %}{% if entry.link2t %} <a href="{{ entry.link2 }}" title="{{ entry.link2t }}">[2]</a>{% endif %}</td>
  </tr>
  {% endfor %}
  </tbody>
</table>

Because a lot of this tech was initially meant for Bitcoin, there are only few articles that specifically mention Litecoin. Fortunately, the tech behind these two coins is relatively similiar, so Litecoin users can now, with minimal porting, take advantage of many of the features that have originally been designed for post-SegWit Bitcoin.

## Litecoin network status

- [Litecoin difficulty](https://bitcoinwisdom.com/litecoin/difficulty)
- [Litecoin hash rate distribution](https://www.litecoinpool.org/pools)
- [Litecoin core dev. roadmap 2017](https://litecoincore.org/)

_I will add entries as I discover them. I cannot guarantee that all information presented is correct / up to date. Last update: 31.01.2018. **If you have anything to add / change, leave a comment below. Thanks!**_
