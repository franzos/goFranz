---
title: "Start using a VPN (with IPv6 support)"
layout: page
source:
date: 2017-01-01 00:00:00 +0200
categories:
- privacy
- security
- test
bg: austin-neill
bg-author: Austin Neill
---

A VPN connection allows you to access region restricted content such as Netflix, helps circumvent government censorship ("The big firewall") and increases your security and privacy online. What's not to like?

Unfortunately the majority of VPN providers don't do a very good job but instead leave you hanging with a slow connection, frequent disconnects and a fatal compromise: They keep track of what you're doing online!

## Must-have's

Here's what you should be looking for:
- A strict no-logs policy
- OVPN Support (don't use PPTP)
- Support for IPv4 and IPv6 (optional but important!)
- They run their own DNS server
- Great support goes a long way
- Alternative payment methods (Bitcoin)
- Option but useful: Warrant Canary ([example](https://proxy.sh/canary.txt)))

## My provider

Fortunately, there are a number of exceptions which I have come to rely on over the past couple of years:

1. [ovpn.se](https://www.ovpn.se/en)
2. [proxy.sh](https://proxy.sh/) (no IPv6)

The first provider that truly served me well was proxy.sh. During my year in Tehran, they kept me connected almost 24/7 even though it was apparent that the government was trying to restrict access.

Unfortunately though proxy.sh does not yet support IPv6 and that's quite a big deal. If for example you're using an Android phone with an IPv4 only VPN, all IPv6 connections simply bypass the VPN unless you're willing to root your phone to fix this issue. While proxy.sh support told me that they are planing to add IPv6 support in the near future, I needed it now.

Since I was already paying for ovpn.se as a backup to proxy.sh, I simply made the switch and put my proxy.sh account on hold for the time being.

### Speed test

I'm quite satisfied with the speed of the VPN connection. Downloads and uploads are fast and Netflix HD streaming works without hiccups. Though I'm sure you're here to see some numbers:

Sweden: `69ms, 51.28Mbps down, 8.80mbps up` - [speedtest.net](http://beta.speedtest.net/result/5999087648)

Netherlands: `134ms, 88.02Mbps down, 8.33mbps up` - [speedtest.net](http://beta.speedtest.net/result/5999104320)

Canada: `248ms, 14.63Mbps down, 8mbps up` - [speedtest.net](http://beta.speedtest.net/result/5999104320)

_The speeds tests have been done connected to the ovpn.se VPN from Berlin, Germany via Tunnelblick App (macOS), using speedtest.net. I don't connect to the internet without VPN, hence I don't know the actual connection speed though it's safe to assume that it's at least 100Mbps down._

## Conclusion

A VPN does does not protect you 100% but it's a huge step in terms of what you can do to increase your privacy and security online.
