---
title: "Web Rendering in Iced: A Few Months On"
description: "A progress update on iced_webview. Blitz went GPU-native, HiDPI stopped fighting me, and Servo hit a version wall."
layout: blog
source:
date: 2026-7-3 0:00:00 +0000
category:
  - Tools
tags:
  - rust
  - iced
  - gui
  - webview
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

Back in February I wrote about [rendering web content in Iced](/blog/web-rendering-in-iced-what-actually-works/) across four backends: litehtml, Blitz, Servo, and CEF. A few months of poking at [iced_webview](https://github.com/franzos/iced_webview_v2) later, enough has changed that it's worth a short update.

## Blitz went GPU-native

The February post made a big deal of two rendering paths: an image-handle path (litehtml, Blitz) where the engine draws the whole document to a pixel buffer and the widget scrolls it, and a shader path (Servo, CEF) where the engine owns its viewport and hands frames to the GPU. That split is collapsing.

Blitz now rasterizes directly onto iced's own `wgpu` device via a shared Vello renderer. No CPU readback, no viewport-sized buffer clone per frame — Vello draws straight into iced's texture. It also owns its own scrolling now, applies `:hover` styles before paint, and does drag-selection. So Blitz moved from the "just a layout library" camp toward behaving like a real engine, while staying pure Rust. That's the change I'm most happy about.

The catch is it only works on iced `master` (wgpu 29) paired with a Blitz alpha, so it lives on a separate branch (`next`) rather than the crates.io release. Bleeding edge, but it works:

```toml
[dependencies]
iced_webview_v2 = { git = "https://github.com/franzos/iced_webview_v2", branch = "next", default-features = false, features = ["blitz"] }
iced = { git = "https://github.com/iced-rs/iced", features = ["advanced", "image", "tokio", "lazy", "wgpu"] }
```

## HiDPI stopped fighting me

On my machines the last post's builds were subtly wrong on HiDPI displays: content stretched vertically by the scale factor, Servo rendering at 2x and upscaling (so everything was soft), text blitting through a bilinear resample instead of 1:1. I'd been papering over it with a manual `set_scale_factor`.

That's all gone. The scale factor is auto-detected across every engine now, content blits 1:1 with the surface, and Servo paints a physical-resolution buffer. Text is crisp. It turns out most of "why does this look blurry" was me applying the display scale twice in different places.

## A security and soundness pass

Remote HTML is hostile input, and I'd been treating the fetch pipeline like it wasn't. So: download size limits are enforced while streaming instead of after buffering the whole body, images per page are capped, litehtml's render height is clamped so a hostile page can't exhaust memory, and a malformed `@import` at the end of a stylesheet no longer panics. The litehtml container access got reworked to raw-pointer provenance too, which closed an aliasing soundness hole that had been quietly sitting there. The SSRF exposure in the fetcher is documented rather than fixed, so treat that as a known edge for now.

## Servo hit a version wall

I upgraded Servo from 0.1 to 0.3 and Blitz to its 0.3 alpha, and the two no longer coexist. Both depend on Stylo, and the versions Blitz-on-iced-master and Servo each need now conflict at the `links` level, so Cargo won't build them together. On the GPU-Blitz branch, Servo is temporarily disabled until it catches up to the newer Stylo.

So the four-backend story from February is really "pick your tradeoff" right now: crates.io release with the stable set, or the `next` branch with GPU Blitz but no Servo.

A couple of people pitched in on this round, which I appreciate. [Nico Burns](https://github.com/nicoburns), who works on Blitz and Taffy upstream, handled the [Servo and Blitz version upgrades](https://github.com/franzos/iced_webview_v2/pull/4) ([and the earlier one](https://github.com/franzos/iced_webview_v2/pull/2)) that the version wall above is all about. [folknor](https://github.com/folknor) [fixed a scale-factor and a close-view panic](https://github.com/franzos/iced_webview_v2/pull/1).

It's still early work and the dependencies underneath it are all moving, but it's moving in the right direction. Repo's [on GitHub](https://github.com/franzos/iced_webview_v2) if you want to follow along.
