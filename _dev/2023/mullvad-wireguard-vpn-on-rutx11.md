---
title: "Mullvad Wireguard VPN on RUTX11"
summary: Configure Mullvad Wireguard VPN on Teltoinka RUTX11 (OpenWRT)
layout: post
source:
date: 2023-10-18 0:00:00 +0000
category:
  - Tools
tags:
  - privacy
  - vpn
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

You can pretty much follow the official guide here: https://mullvad.net/en/help/running-wireguard-router/. Below are some notes to complement the instructions.

### Configuration

When you generate the Wireguard configuration at https://mullvad.net/en/account/wireguard-config, make sure to select:

1. Server connection protocol: IPv4
2. Tunnel traffic: Only IPv4

If you want to use IPv6, you'll need to do NAT on the router, which is tricky. I've found it's easier to just leave it off until Mullvad provides a /64 IPv6 range, which would allow this to work, as designed.

The configuration looks like this:

```
[Interface]
# Device: Sacred Rhino
PrivateKey = SG5V4pwsGyerssT72iPPytXb0gDOVzyUdOCVOptfgW8=
Address = 10.68.223.115/32,fc00:bbbb:bbbb:bb01::5:df72/128
DNS = 10.64.0.1

[Peer]
PublicKey = C3jAgPirUUG6sNYe4VuAgDTYunENByG34X42y+SBngQ=
AllowedIPs = 0.0.0.0/0,::0/0
Endpoint = 193.32.127.69:51820
```

### Setup Wireguard VPN

- Copy the private key from the config
- Copy the public key from the Mullvad web interface
- Copy the public key for the peer, from the config
- Setup the peer with Allowed IP's `0.0.0.0/1` (instead of `0.0.0.0/0`)
- Set MTU of `1280`
- DNS Server `10.64.0.1`

<img src="/assets/images/gist/mullvad-wireguard-vpn-on-rutx11-interface.png">

#### Firewall

Make sure to configue the zones (/network/firewall/zones) properly (ignore openvpn):

<img src="/assets/images/gist/mullvad-wireguard-vpn-on-rutx11-firewall.png">

#### DNS

The DNS (`10.64.0.1`) needs to be added in 4 places:

1. `/network/dns` (DNS forwardings)
2. `/network/interfaces/general` -> WAN (Use custom DNS servers)
3. `/network/interfaces/general` -> LAN (Use custom DNS servers)
4. `/services/vpn/wireguard` -> Wireguard Interface (DNS servers); previous step

I'd suggest to double-check everything again and restart the router.

At this point you should have an active Wireguard connection that routes traffic from devices on your network trough Mullvad's VPN server. Do check that you're not leaking: https://mullvad.net/en/check

Personally I went back to OpenVPN because even though Wireguard got me 5x the speed on the device (it's much more efficient than OpenVPN), the servers I tried were all blacklisted on many hosts so I was pretty much stuck on DuckDuckGo with many other sites giving me a connection error.

Using a proxy helped, but wouldn't work on all devices:

```bash
chromium --proxy-server="socks5://10.64.0.1:1080"
```
