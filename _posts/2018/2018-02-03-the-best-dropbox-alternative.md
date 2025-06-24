---
title: "The best Dropbox alternative"
summary: "Using Syncthing as an open-source Dropbox alternative to sync files between laptop and Android phone over mobile data while traveling."
layout: post
source:
date: 2018-02-03 22:00:00 +0350
category:
  - Privacy
  - Tools
tags:
  - syncthing
  - privacy
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

## The Story

I spend a lot of time on the road, so my laptop is usually Wi-Fi tethered to my Android phone with a pretty stable 50-80 Mbps 4G+ connection and a sweet 90 GB data plan. Both devices run an open source software called [Syncthing](https://syncthing.net/) which syncs, among other files, photos I've taken on the phone, and music I've added on the laptop.

The thing is, I don't really want to spend all that data on synchronization, and neither do I want to manually sort things out, every time I connect. Also, I'm not willing to give my files to a 3rd party, just for the convenience of synchronizing it - encrypted or not.

## Meet Syncthing

Unlike Dropbox, Syncthing does not rely on servers to store, or synchronize your files. It doesn't even require any sign-up, accounts or passwords. You simply install Syncthing on the devices you'd like to synchronize, and literally add them to each other. This is as easy as scanning a barcode on your laptop with the application on your phone.

![Sia](/assets/content/2018/the-best-dropbox-alternative.png)

We're not done yet: Because I'm usually tethered to my phone, getting a 4GB video recording from my phone, to my laptop, takes less than 30 seconds, and about 12 kb of mobile data. Everything happens automatically, in the background and within seconds of them being connected, directly over the Wi-Fi connection.

While Dropbox supports LAN sync, your files will ultimately end up on their cloud. With Syncthing, you data stays on the devices you're synchronizing. All settings are configured client-side and new connections have to be approved by you. That also means, that you can easily share files and folders with friends and family.

If you still want to run a sync server, simply install the Syncthing client on a 3rd device.

### Bonus

Syncthing comes with a lot of features, but one I very much appreciate is the file versioning. You can configure Syncthing to keep X GB of recently deleted files in a hidden folder, so if someone accidentally removes something, you can easily recover it on your end.

## Final words

While Syncthing is free to use, I'd suggest you to donate on their [website](https://syncthing.net/), to fund development and discovery servers.

<hr>

**Update: 2024-07-07**

I've recently started using Syncthing to handle Backup on GrapheneOS:

1. Setup Backup as usual, and use "Internal Storage" location
2. Run a backup; This should create a `~/.SeedVauldAndroidBackup` folder on your device
3. Point Syncthing at this folder, and have it transferred to wherever

Works great, is free and the encrypted backup never get's stored anywhere, except devices I control.