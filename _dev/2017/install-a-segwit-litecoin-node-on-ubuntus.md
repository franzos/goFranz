---
title: "How-To ready your Litecoin node for SegWit on Ubuntu"
layout: post
os:
  - Linux
date: 2017-05-04 00:00:00 +0200
category:
  - dev
  - crypto
tags:
  - litecoin
  - development
  - ubuntu
  - linux
  - segwit
---

## Minimum Requirements

- (Ubuntu) Linux System with 2GB+ RAM
- 16GB free disk space (current DB size 7.48 GB, April 17)
- Broadband internet

For AWS EC2 based servers, I recommend type t2.small (1vCPU, 2GB) with 20GB of instance storage.

## Instructions

### Update Ubuntu

Before you do anything, make sure Ubuntu system is up to date:

`sudo apt-get update -y && sudo apt-get upgrade -y && sudo reboot`

### Set-up Litecoin Node

If you haven't set-up Litecoin yet, now is a good time: [How-To set-up a UASF / SegWit ready Litecoin node on Ubuntu](/dev/running-a-full-UASF-litecoin-node-on-ubuntu). If you're already running a Litecoin node, proceed below.

#### 1) Check your Litecoin version

`./[path-to-litecoin-cli]/litecoin-cli getnetworkinfo`

    {
      "version": 130200,
      "subversion": "/Satoshi:0.13.2/",
      "protocolversion": 70015,
      "localservices": "000000000000000d",
      "localrelay": true,
      "timeoffset": 0,
      "connections": 8,
      "networks": [
        {
          "name": "ipv4",
          "limited": false,
          "reachable": true,
          "proxy": "",
          "proxy_randomize_credentials": false
        },
        {
          "name": "ipv6",
          "limited": false,
          "reachable": true,
          "proxy": "",
          "proxy_randomize_credentials": false
        },
        {
          "name": "onion",
          "limited": true,
          "reachable": false,
          "proxy": "",
          "proxy_randomize_credentials": false
        }
      ],
      "relayfee": 0.00100000,
      "localaddresses": [
      ],
      "warnings": ""
    }

Based on this output, we can verify that we're running Litecoin version 0.13.2. If you're running Litecoin 0.13.1 or later, your node already supports SegWit - proceed with 2). If you're running 0.13.0 or below, it's time to upgrade: [How-To set-up a UASF / SegWit ready Litecoin node on Ubuntu](/dev/running-a-full-UASF-litecoin-node-on-ubuntu).

#### 2) Add UASF signaling

`mkdir ~/.litecoin && echo "uacomment=UASF-SegWit-BIP148" >> ~/.litecoin/litecoin.conf`

#### 3) Autolaunch

`crontab -e`

Simply add the following line at the bottom of your crontab and exit with CTRL+C.

`@reboot /[path-to-litecoind]/litecoind -daemon`

#### 4) Reboot

`sudo reboot`

After the reboot, simply enter `top` in your terminal. The process `litecoind` should be listed at the top, with a CPU consumption of up to 99.9%. At this point, the node is synchronising the blockchain.

#### 6) Verify

As a last step, we'll need to verify that our Litecoin node is signaling SegWit / UASF.

`./[path-to-litecoin-cli]/litecoin-cli getnetworkinfo`

Here's what you should be looking for:

    {
      "version": 130200,
      "subversion": "/Satoshi:0.13.2(UASF-SegWit-BIP148)/",
      "protocolversion": 70015,
      "localservices": "000000000000000d",
      "localrelay": true,
      "timeoffset": 0,
      "connections": 8,
      "networks": [
        {
          "name": "ipv4",
          "limited": false,
          "reachable": true,
          "proxy": "",
          "proxy_randomize_credentials": false
        },
        {
          "name": "ipv6",
          "limited": false,
          "reachable": true,
          "proxy": "",
          "proxy_randomize_credentials": false
        },
        {
          "name": "onion",
          "limited": true,
          "reachable": false,
          "proxy": "",
          "proxy_randomize_credentials": false
        }
      ],
      "relayfee": 0.00100000,
      "localaddresses": [
      ],
      "warnings": ""
    }

Based on this output, we can verify that we're signaling UASF `0.13.2(UASF-SegWit-BIP148)` and that our node is connected to the internet via ipv4 and ipv6.

#### 7) Open Ports

Finally, make sure that port 8333 is open. There are some great, easy to follow instructions on [bitcoin.org](https://bitcoin.org/en/full-node#enabling-connections).

#### Running nodes

_Last update: 2017-10-26_

`52.59.225.35` - (BTC) Satoshi:0.13.2(UASF-SegWit-BIP148) - *offline*
<br>`54.93.180.33` - (LTC) Satoshi:0.14.0(UASF-SegWit-BIP148) - *offline*
