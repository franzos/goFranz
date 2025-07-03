---
title: "... is damaged and can’t be opened. You should move it to the Trash."
layout: blog
version: macOS 10.12 Sierra
os:
  - macOS
source:
date: 2017-01-01 00:00:00 +0200
category:
  - troubleshooting
tags:
  - macOS
---

If you've seen this error more frequently in recent months: Welcome to macOS Sierra and the future of personal computing. What's happening here is, that Gatekeeper, a security feature that's been around since Mac OS X 10.7.5, is a lot more aggressive since Sierra.

Luckily - if you know what you're doing - there's an easy way to disable

`sudo spctl --master-disable`

and enable

`sudo spctl --master-enable`

Gatekeeper.

Simply enter this into the Terminal and you'll be good to go. In any case, I suggest to re-enable Gatekeeper after you're done. Better to play by the rules on macOS or your Mac will punish you.
