---
title: "Hello Nostr"
summary: The Nostr protocol offers a decentralized way to build services and platforms like social networks, crowd-funding sites, or Uber alternatives. It uses a single key for identity across all services, ensuring more control over your account and data. However, it comes with challenges like irreversible account loss if you lose your key and some client-side performance issues. 
layout: post
source:
date: 2023-08-28 0:00:00 +0000
category:
  - Tools
tags:
  - privacy
  - development
  - social-media
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I've recently set out to develop a new platform called TBD. It was supposed to be a mash-up of all these individual sites like Twitter, Ebay and Etsy, with the twist that instead of registering an account on each site, you would generate a key on your computer, to identify yourself. Much like you have a Bitcoin wallet key, you would have a TBD key, that you use to sign transactions and messages.

About half a month into the development, I stumbled across Nostr.

As it turns out, Nostr does most of what I set out to do, so the decision to abandon TBD was swift and easy; Let me tell you what excites me about Nostr:

1. It's a protocol; Think of it as a **layer on top of the Internet**, that enables developers to build virtually anything - from social network, to crowd-funding, to an Uber alternative.
2. Because it's a protocol, **one key / identify, should be able to access all services**. That's not only convenient, but also means that no single entity can exclude you from the network.
3. Maybe more importantly, because it's a protocol, it **does not discriminate** against any type of content. Nostr doesn't know good or bad.

### Nostr vs. Mastodon vs. Matrix vs. Twitter (X)

Let me illustrate the difference:

|                              | Nostr         | Mastodon    | Matrix      | Twitter, Twitch, Amazon...    |
|------------------------------|---------------|-------------|-------------|-------------------------------|
| Control over your account    | Yes           | Partial     | Partial     | No                            |
| Control over your data       | Partial (1)   | Partial (1) | Partial (1) | Partial                       |
| Publish your data (provider) | Any, Multiple | Any         | Any         | Same provider                 |
| Sell your kidney TOS         | No            | No          | No          | Have you read the TOS?        |
| Bring your own client        | Yes           | Yes         | Yes         | Sometimes (subject to change) |
| Easy account recovery        | No            | Yes         | Partial     | Yes                           |
| Can be private (on LAN)      | Yes           | Yes         | Yes         | No                            |

A couple of points:

- Control over your account: The problem with Twitter is obvious - you're at the mercy of Twitter - even if you're the president of the United States. However, Mastodon or Matrix is not much better. While you can run your own Mastodon server, most people will rely on someone else to do it, and so we're back at the Twitter problem, and even though Mastodon is open source, it doesn't change the fact that your handle is tied to a specific server (for ex. `@franz:pantherx.social`) and virtually impossible to "move". To be fair, you can set a redirect on both Mastodon and Matrix (account moved) - but that means you rely on the server and can only hope that your redirect stays up in case of disagreement or otherwise.
- Control over your data: Nostr, Mastodon, Matrix and Twitter aren't too different in this aspect; Once your data is online, it's online. Sure there's a delete button on Twitter, but if you think Twitter is deleting all that valuable data about you, you're out of luck. Theoretically, this is handled better on Nostr, Mastodon and Matrix, but what actually happens is up to the server provider.
- Publish your data (provider): In theory you can always publish to multiple networks, or servers in case of Mastodon. The difference on Nostr is, that the message you post to multiple provider, is the same message with the same ID and signature so it's still unique, but redundant.
- Can be private (on LAN): Nostr, Mastodon and Matrix can all be run on a local / private network. This is nice for groups of people (a family / fanclub / community / .. server), and important for companies (data ownership). 

(1) On a private server (and network), you retain 100% control over your data.

### How does Nostr work?

I keep this brief:

1. The application you use, generates a key which you use to identify yourself
2. You use this key to sign messages and send them to any number of servers
3. Other people can interact with your messages

These basic rules can turn into a simple Twitter-like feed, an encrypted group-chat, and even a market place with payments powered by the Bitcoin lightning network.

### Why Care?

1. Total control over your account: use different / multiple providers
2. No client lock-in. Ads? Tracking? Don't like it? Use a different client.
3. Proof of authorship: Every post is signed and everyone can verify

#### Problems

1. Account recovery is impossible; That's good and bad. Good because it means that no one can take over your account, bad because if you lose your key, you're out of luck.
2. It's sure not as efficient as a rest-api request with a sql-join so a lot of work needs to happen on client side.

In many ways, 2 is a strength of Nostr but developing and using the available clients, you'll be quick to notice the overhead. At least I do, on my aging Android phone. It will be interesting to watch how this scales, when we users grow from what's estimated to be between half and one million, to 100 million - but that's plenty of time to tweak.

### What do I know?

I've spend the past month implementing the Nostr protocol, and developing a client based on it. Granted, I'm late to the party and there's already other libraries and clients but I felt this would be the best approach for me to better understand how it works, and what impact it has on server and client side.

Try Nostr yourself, here: [https://franzos.github.io/nostr-ts/](https://franzos.github.io/nostr-ts/) ([code](https://github.com/franzos/nostr-ts)).