---
title: "Run (Cursor) AppImage on Guix"
summary: "Use Guix to run AppImages in a container with the necessary dependencies."
layout: post
source:
date: 2025-6-01 0:00:00 +0000
category:
  - Tools
tags:
  - development
  - llms
  - tools
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

Sometimes you come across an application that's not available on Guix, nor Flathub, but only as AppImage. These can be a bit of a hassle to deal with, but with a little trial an error, just as easy as any other package.

Today I wanted to try the latest version of Cursor, the "AI IDE".

Download:

```
cd /tmp && mkdir cursor && cd cursor
wget https://downloads.cursor.com/production/96e5b01ca25f8fbd4c4c10bc69b15f6228c80771/linux/x64/Cursor-0.50.5-x86_64.AppImage
```

Spawn a Guix shell with the necessary dependencies:

```bash
guix shell --container --network --emulate-fhs --expose=/tmp/cursor=$HOME/target coreutils zlib gcc-toolchain nss fuse sed grep glib at-spi2-core cups gtk+ eudev alsa-lib --preserve='^DISPLAY$'
```

Extract the AppImage and run it:

```bash
./Cursor-0.50.5-x86_64.AppImage --appimage-extract
cd squashfs-root
./AppRun
```

![Cursor running on Guix](/assets/images/blog/run-cursor-appimage-on-guix.png)