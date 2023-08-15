---
layout: page
title: "NFT Marketplace"
date: 2023-03-21 00:00:00 +0200
client: "onesnow"
cover: onesnow-nft-01.png
bg: roman-kraft
tags: "web development"
introduction: OnesMarket makes it easy to create new NFT's without prior experience of blockchain technology.
featured: true
---

{% include project-image.html image="onesnow-nft-01.png" %}
{% include project-image.html image="onesnow-nft-02.png" %}
{% include project-image.html image="onesnow-nft-03.png" %}

### Website technology

OnesMarket is a handcrafted NFT marketplace that enables users to mint, buy and sell NFTs to (initially) users in Thailand and China. The market is integrated with the ONES ecosystem, and all KYC-verified ONES users can take advantage of SSO-login. The market backend is written in Typescript and integrates a private Ethereum-based blockchain for issuance, and IPFS for NFT asset storage.

- Vue 3 frontend with Pinia state management
- NestJS backend (Express + Typescript)
- Integrates Ethereum blockchain
- Relies on IPFS for NFT assets