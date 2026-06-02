---
title: Software
layout: page_wide
fil: true
permalink: /software/
description: "Apps, libraries, CLIs and tools I've built and put on GitHub — mostly Rust. The polished projects have their own page; the rest link straight to their repo."
---

<div class="swindex">
  <p class="swintro">Apps, libraries, CLIs and tools I've built and put on GitHub — mostly Rust. The polished ones have a page here; the rest link straight to their repo, where the README and versions actually live.</p>

  <div class="sw-rowlabel"><span class="bar"></span>Apps &amp; tools · with a page here</div>
  <ul class="swlist">
    {% assign featured_sw = site.software | where: "featured", true | sort: "weight" %}
    {% for sw in featured_sw %}
    <li>
      <a href="{{ sw.url }}">
        <span class="n">{{ sw.name }}</span>
        <span class="d">{{ sw.card_blurb | default: sw.description }}</span>
        <span class="m">{{ sw.lang | default: "Rust" }}</span>
        <span class="go">details &rarr;</span>
      </a>
    </li>
    {% endfor %}
  </ul>

  <div class="sw-rowlabel"><span class="bar"></span>Libraries · on GitHub</div>
  <ul class="swlist">
    {% assign libs = site.software | where: "kind", "library" | sort: "name" %}
    {% for sw in libs %}
    <li>
      <a href="{{ sw.repo }}" rel="noopener">
        <span class="n">{{ sw.name }}</span>
        <span class="d">{{ sw.blurb }}</span>
        <span class="m">{{ sw.lang }}</span>
        <span class="go">&#8599; github</span>
      </a>
    </li>
    {% endfor %}
  </ul>

  <div class="sw-rowlabel"><span class="bar"></span>Command-line tools &amp; daemons · on GitHub</div>
  <ul class="swlist">
    {% assign tools = site.software | where: "kind", "tool" | sort: "name" %}
    {% for sw in tools %}
    <li>
      <a href="{{ sw.repo }}" rel="noopener">
        <span class="n">{{ sw.name }}</span>
        <span class="d">{{ sw.blurb }}</span>
        <span class="m">{{ sw.lang }}</span>
        <span class="go">&#8599; github</span>
      </a>
    </li>
    {% endfor %}
  </ul>
</div>
