---
title: "Sia encrypts and stores files for a fraction of the cost of AWS S3"
layout: post
source:
date: 2017-05-12 08:00:00 +0200
category:
  - Cryptocurrency
tags:
  - crypto
  - siacoin
  - "cloud storage"
  - aws
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

Sia, originally conceived at HackMIT 2013, promises a completely private, decentralized, cloud data store at 1/10th of the cost of Amazon AWS S3. Sia splits, encrypts and distributes your file across a network of computers that offer to provide their unused pace.

## Advantages

- **Highly redundant files**: Files fragments are stored in multiple locations, so even if a couple of nodes go down, you'd still be able to restore your file.
- **Faster up/downloads**: Once the network grows, your files are likely to be stored much closer to you, giving you superior download speeds compared to far away providers or possibly congested networks routes.
- **Effective network**: If Sia works efficiently, load should be spread out evenly across the network, rather than everyone accessing a central location (single point of failure) such as AWS datacenter in Ireland or basically every other centralized cloud provider.
- **Security**: Unlike traditional cloud providers, your file is split-up and encrypted before it leaves your computer. That means, no single node hosts a complete copy of your file - even if, your files are encrypted with your private key.
- **Privacy**: Sia doesn't ask or store any of your details. Literally all you need is SC (Siacoin), to pay for the service anonymously. In fact, you don't even need an email - just your password.

![Sia](/assets/content/2017/sia-encrypts-and-stores-files-for-a-fraction-of-the-cost-of-AWS-S3_01.png)

Let's take a short break and reflect: Sia is next-generation stuff. We've all heard of Dropbox and Google Drive but Sia could potentially be the Dropbox of tomorrow. In fact, Sia could replace almost any data storage solution that exists today. Even more, I imagine that even services like Dropbox will eventually take a bite from the Sia approach because it's a lot more scalable, cheaper and comes with all the benefits that the future customer expects from their cloud service provider: Speed, uptime, privacy.

Sia is by far not the only startup in this niche but they have a working client, a clear roadmap and my vote. But don't get too excited, we're years away from this becoming standard but you can already reap the benefits today.

## Backup files using Sia

For the sake of 99.8% of the world population, this guide assumes that you've never really had anything to do with cryptocurrency and don't really know what Ethereum or Bitcoin is. The point is, you will need to pay for Sia with SC (Siacoin). SC is a cryptocurrency.

### 1) Download

Visit the [Sia website](http://sia.tech/apps/) and download the *Sia-UI* client. Sia is available for Linux, macOS and Windows. LTS (long term support) releases are also available and promise a more stable experience, while forgoing some of the latest features [Sia LTS download](http://sia.tech/lts/).

### 2) Installation

Depending on your OS, this step will differ. On macOS, unzip the folder and move the application *Sia-UI* to your applications folder.

### 3) Launch Sia

After the first launch, Sia needs to synchronize the blockchain. This may take up to 2+ hours, depending on your connection speed. Before you do anything, let this finish.

![Sia](/assets/content/2017/sia-encrypts-and-stores-files-for-a-fraction-of-the-cost-of-AWS-S3_03.png)

### 4) Create a wallet, top-up your balance

#### Create a wallet

Select *Create a new wallet*

![Sia](/assets/content/2017/sia-encrypts-and-stores-files-for-a-fraction-of-the-cost-of-AWS-S3_04.png)
![Sia](/assets/content/2017/sia-encrypts-and-stores-files-for-a-fraction-of-the-cost-of-AWS-S3_05.png)

It is essential that you never disclose your seed or password to anybody. With the help of your seed, you can restore access to your wallet and balance, in case you ever lose it - anybody can. That's because your balance is stored on the Blockchain and the seed serves as a key to access your wallet.

![Sia](/assets/content/2017/sia-encrypts-and-stores-files-for-a-fraction-of-the-cost-of-AWS-S3_06.png)

Take note of your wallet address, we will need it for the next step:

![Sia](/assets/content/2017/sia-encrypts-and-stores-files-for-a-fraction-of-the-cost-of-AWS-S3_07.png)

### Top-up your wallet

Now the interesting part starts: Before you can use Sia, you will need Siacoin (SC). To obtain SC, you need to have money but cryptomoney. It really sounds more complicated than it is.

#### Where can I get cryptocurrency?

There are many ways to obtain, for example, Bitcoin, Litecoin or Ethereum.

- [LocalBitcoins](https://localbitcoins.com/): Buy and sell bitcoins near you
- [Kraken](https://www.kraken.com/): A crypto exchange, wire money, exchange to crypto
- [Coinbase](https://www.coinbase.com/): A lot more end-user friendly, good for US customers
- [bitcoin.de](https://www.bitcoin.de/en): A very easy way to buy via wire transfer, great for EU, perfect for German customers with Fidor accounts.

To get started, you need less than 0.011764706 BTC (20 Euro at the current rate of 1BTC = 1702 Euro). If you've bought a lot more Bitcoin than necessary, I suggest to store it in a Bitcoin wallet such as [Jaxx](https://jaxx.io/).

#### What cryptocurrency is supported?

You can start out with virtually any virtual currency, so long it's supported by [ShapeShift](https://shapeshift.io/#). You can't go wrong with Bitcoin, Litecoin or Ethereum.

#### Exchange the coins you've obtained for SC

The next step is easy. Once you've obtained your crypto, visit [shapeshit.io](https://shapeshift.io/#) and select the two coins / assets you're planning to exchange. In my case, LTC (Litecoin) to SC (Siacoin).

![Sia](/assets/content/2017/sia-encrypts-and-stores-files-for-a-fraction-of-the-cost-of-AWS-S3_08.png)

1. Select your pair and continue
2. Enter your Siacoin wallet address
3. Enter your wallet refund address
4. Start transaction

![Sia](/assets/content/2017/sia-encrypts-and-stores-files-for-a-fraction-of-the-cost-of-AWS-S3_09.png)

### 5) Create an allowance to store files

Once you've received SC in your Sia wallet, we can go ahead and create an allowance: You need to allocate funds to upload and download on Sia. Your allowance remains locked for 3 months. Unspent funds are then refunded*. You can increase your allowance at any time.

![Sia](/assets/content/2017/sia-encrypts-and-stores-files-for-a-fraction-of-the-cost-of-AWS-S3_10.png)

What happens now is, that Sia connects to other nodes around the network, to try to allocate disk space in form of a commitment. These nodes will be paid based on

- how long you store the file
- the size of the file
- upload/download bandwidth

This process takes some time but you can sort of follow progress in your Wallet, as SC gets automatically deducted to pay for the contracts we've set-up.

![Sia](/assets/content/2017/sia-encrypts-and-stores-files-for-a-fraction-of-the-cost-of-AWS-S3_11.png)

### 6) Upload your first file

Once the contracts are set-up, we can start uploading our first file. For the time being, Sia is best suited for large files so I highly recommend it for single-file backups such as a dated ZIP of a server backup or even yearly backups of your family photos.

![Sia](/assets/content/2017/sia-encrypts-and-stores-files-for-a-fraction-of-the-cost-of-AWS-S3_12.png)

I tried to upload a 1GB backup file: The speeds are good at 2.54 MB/s - 3.16 MB/s on a 5 MB/s connection.

![Sia](/assets/content/2017/sia-encrypts-and-stores-files-for-a-fraction-of-the-cost-of-AWS-S3_13.png)

Once your file has completed uploading, Sia will improve redundancy. You can track progress by looking at the file. A 3x stands for 3x redundancy.

![Sia](/assets/content/2017/sia-encrypts-and-stores-files-for-a-fraction-of-the-cost-of-AWS-S3_15.png)

### 7) Sit back and enjoy

Accoring to a [study](http://www.jbs.cam.ac.uk/faculty-research/centres/alternative-finance/publications/global-cryptocurrency/#.WRMKqFKiEQ8) by Cambridge University there were less than 3 million cryptocurrency users worldwide in early 2017. **You're now one of us**.

## What's next

If you're wondering what's next, checkout the [Sia Public Roadmap](https://trello.com/b/Io1dDyuI/sia-public-roadmap). Here are my favourites:

### June 2017

- File sharing with other Sia users
- Faster Blockchain sync

### Next 6 Months

- Proper support for small files (below 40 MB)
- Faster file contract forming
- Video streaming

### Next 2 Years

- File sharing with non-Sia users
- Mobile wallet / light client
- Seeed based file recovery
