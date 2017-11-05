---
title: "How-To set-up a UASF / SegWit ready Litecoin node on Ubuntu"
layout: post
os:
  - Linux
date: 2017-04-10 00:00:00 +0200
category:
  - development
  - cryptocurrency
tags:
  - litecoin
  - development
  - ubuntu
  - linux
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

These instructions assume that you're running an Ubuntu Server 16.04 LTS though this should work on almost any 64bit Linux machine.

#### 1) Download the latest version

`wget https://download.litecoin.org/litecoin-0.13.2/linux/litecoin-0.13.2-x86_64-linux-gnu.tar.gz`

You can find the latest download links on the Litecoin website [https://litecoin.org/](https://litecoin.org/#download). Look for the 64bit Linux client. If there's a newer release than 0.13.2, make sure you update all paths accordingly.

#### 2) Extract the download

`tar -xvf litecoin-0.13.2-x86_64-linux-gnu.tar.gz`

#### 3) Add UASF signaling

`mkdir ~/.litecoin && echo "uacomment=UASF-SegWit-BIP148" >> ~/.litecoin/litecoin.conf`

#### 4) Autolaunch

`crontab -e`

If you're prompted for an editor, I'd suggest 2) /bin/nano. Once you're in, simply add the following line at the bottom of your crontab and exit with CTRL+C.

`@reboot ~/litecoin-0.13.2/bin/litecoind -daemon`

#### 5) Reboot

`sudo reboot`

After the reboot, simply enter `top` in your terminal. The process `litecoind` should be listed at the top, with a CPU consumption of up to 99.9%. At this point, the node is synchronising the blockchain.

#### 6) Verify

As a last step, we'll need to verify that our new Litecoin node is signaling UASF and connects to the internet.

`./litecoin-0.13.2/bin/litecoin-cli getnetworkinfo`

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

Based on this output, we can verify that we're signaling UASF `0.13.2(UASF-SegWit-BIP148)` and that we're connected to the internet via ipv4 and ipv6.

#### 7) Open Ports

Finally, make sure that port 8333 is open. There are some great, easy to follow instructions on [bitcoin.org](https://bitcoin.org/en/full-node#enabling-connections).

#### Running nodes

_Last update: 2017-10-26_

`52.59.225.35` - (BTC) Satoshi:0.13.2(UASF-SegWit-BIP148) - *offline*
<br>`54.93.180.33` - (LTC) Satoshi:0.14.0(UASF-SegWit-BIP148) - *offline*
