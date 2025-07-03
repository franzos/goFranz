---
title: "OpenVPN on Android + Wi-Fi Tethering w/o root"
summary: "How to set up OpenVPN connection on Android with Wi-Fi tethering to your laptop without needing third-party apps or root access."
layout: blog
source:
date: 2018-02-03 22:00:00 +0350
category:
  - Android
  - VPN
tags:
  - android
  - tethering
  - privacy
  - vpn
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

There are hundreds of apps on the Google Play Store that promise you a OpenVPN connection on your Android + Wi-Fi tethering to your laptop. However, it's easy to accomplish this without any 3rd party application, or even root access.

## Here's how it works

1. Create a Wi-Fi hotspot and connect to it from your laptop
2. Connect to OpenVPN on your Android phone
3. Connect to OpenVPN on your laptop

### If you're already connected to the VPN on your mobile phone

1. Create a Wi-Fi hotspot and connect to it (your laptop won't get a valid IP)
2. Reconnect the OpenVPN connection on the phone

While the VPN is reconnecting, your laptop should be able to obtain a valid IP from your phone, so after the VPN on your phone reconnects, your laptop should remain connected. Do note, that your laptop wont use the Android VPN connection but should establish it's own VPN connection.

## Tips

- Use [OpenVPN for Android](https://play.google.com/store/apps/details?id=de.blinkt.openvpn&hl=en)
- If you're on a Mac, use [Tunnelblick](https://www.tunnelblick.net/) and set your VPN connection to connect and re-connect automatically
- Use a VPN provider that allows at least 2 connections
