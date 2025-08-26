---
title: "A Surface-Level Look at LLM Vendor Privacy"
summary: "A quick overview of how AI vendors handle your data, focusing on privacy and tracking practices."
layout: blog
source:
date: 2025-08-05 0:00:00 +0000
category:
  - Tools
tags:
  - openai
  - claude
  - llms
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

Today, I'm taking a quick look at how AI vendors handle your data. We know very little about what happens with the information you submit to various LLMs. Although many promise not to use your data for training, those claims can feel dubious. Instead of relying on marketing language, let's examine publicly accessible details to get a clearer picture of how these companies treat your data before you share anything personal.

I only explored what’s available without logging in—using a Google login or providing your email would likely expose even more information.

## Vendors

### Venice AI

venice.ai/

- cdn.venice.ai: Static files/docs for Venice AI
- assets.basehub.com: Asset hosting for BaseHub
- amped.venice.ai: Venice AI-related service
- connect.facebook.net: Facebook SDK, plugins, and tracking
- static.ads-twitter.com: Twitter (X) ad serving and tracking assets
- analytics.tiktok.com: TikTok tracking and analytics
- plausible.io: Privacy-focused website analytics
- us-assets.i.posthog.com: CDN for PostHog analytics
- cdn.spindl.xyz: Spindl-hosted static assets
- www.google.com: Google homepage and services
- googleads.g.doubleclick.net: Google Ads delivery and tracking
- spindl.link: Spindl link redirection

~ 119 requests and 7.64 MB / 3.70 MB transferred

I could not chat from here, even though the site implied I could; Trying to use the chat, I was redirected to `venice.ai/chat` which greeted me with an error: We experienced an error with Venice.ai.

The error was caused by JShelter; Disabling the JavaScript Shield and Fingerprint detector, made the site to work.

venice.ai/chat

- clerk.venice.ai: Authentication via Clerk for Venice AI
- ph.venice.ai: Venice AI analytics via PostHog
- pulse.walletconnect.org: Status and ping service for WalletConnect
- api.web3modal.org: API for connecting Web3 wallets
- js.stripe.com: Stripe JavaScript for payment integration
- m.stripe.network: Stripe networking and fraud prevention services
- fonts.googleapis.com: Google Fonts CSS delivery
- fonts.gstatic.com: Google Fonts font file hosting
- outerface.venice.ai: Venice AI frontend interface module
- www.datadoghq-browser-agent.com: Datadog browser monitoring agent code

~ 149 requests and 21.49 MB / 7.80 MB transferred

On a positive note, you can trial the application without login.

### NanoGPT

nano-gpt.com/

- ik.imagekit.io: Image CDN and optimization service
- video.gumlet.io: Video delivery via Gumlet CDN
- longstories.ai: Longform content generation via AI

~ 29 requests and 7.73 MB / 7.25 MB transferred

Loads more progressively:

- media.licdn.com: LinkedIn media content delivery (images, videos)
- www.redditstatic.com: Static assets for Reddit (JS, CSS, images)

Again, I could not chat from here and was redirected to `nano-gpt.com/conversation/new` which loaded another huge chunk of assets.

- nano-gpt.com: Website for NanoGPT, a minimal GPT implementation
- ik.imagekit.io: Image CDN and optimization service
- video.gumlet.io: Video delivery via Gumlet CDN
- longstories.ai: Longform AI-generated content and storytelling
- i.redd.it: Reddit-hosted media content (images, GIFs)
- media.licdn.com: LinkedIn media content delivery (images, videos)
- www.redditstatic.com: Static assets for Reddit (JavaScript, CSS, icons, etc.)

~ 527 requests and 68.54 MB / 24.51 MB transferred

There's one request I found curious: `nano-gpt.com/landing/static-tracking.js` which came back with a script that appears to feed data to Google Tag Manager and others:

```javascript
const PIXEL_IDS = {
  FACEBOOK: '1225290579344930',
  TWITTER: 'orwzh',
  REDDIT: 'a2_h48k9duwsl2n',
  GTM_CONTAINER: 'GTM-NP5FVPF4'
};
```

Positive: You can trial the application without login.

### OpenRouter

openrouter.ai/

- clerk.openrouter.ai: Authentication via Clerk for OpenRouter
- t0.gstatic.com: Google static content (images/fonts) delivery
- static.cloudflareinsights.com: Cloudflare browser analytics and performance

~ 124 requests and 8.80 MB / 2.26 MB transferred

It's not possible to trial the application without login.

### Claude.ai

claude.ai/

This page send me straight to a Cloudflare captcha.

- play.google.com: Google Play Store services and app distribution
- challenges.cloudflare.com: Cloudflare bot checks and security challenges
- a-cdn.claude.ai: Claude (Anthropic) asset delivery via CDN
- accounts.google.com: Google account login and authentication
- statsig.anthropic.com: Experimentation and analytics for Anthropic/Claude
- connect.facebook.net: Facebook SDK, plugins, and user tracking
- fonts.gstatic.com: Hosting for Google Fonts font files
- widget.intercom.io: Intercom web chat and support widget
- js.intercomcdn.com: Intercom frontend script loading
- www.gstatic.com: Google static content delivery
- a-api.anthropic.com: API for Claude (Anthropic's language model)
- s-cdn.anthropic.com: Secure/static content delivery for Anthropic services

~ 177 requests and 16.63 MB / 6.28 MB transferred

It's not possible to trial the application without login.

### OpenAI

openai.com/

- static.cloudflareinsights.com: Cloudflare browser analytics and performance
- cdn.openai.com: Content delivery for OpenAI services and UIs
- images.ctfassets.net: Asset hosting for Contentful-managed content
- chatgpt.com: OpenAI's ChatGPT web interface
- featureassets.org: General-purpose hosting for feature assets
- browser-intake-datadoghq.com: Data ingestion for Datadog browser performance monitoring
- prodregistryv2.org: Likely a production registry (possibly for app/package updates)

~ 143 requests and 97.24 MB / 89.53 MB transferred

I wasn't able to actually do anything here, even though the site implied I could. Trying to use the chat, I was redirected to `chatgpt.com/?openaicom_referred=true&model=auto` which greeted me with an error: Your browser is out of date. Update your browser to view this site properly... Again, JShelter at work; Disabling Shield and Fingerprint detector made the site work, and I was greeted with a Cloudflare captcha.

- challenges.cloudflare.com: Cloudflare bot protection and challenge verification
- cdn.oaistatic.com: CDN for OpenAI static content and assets
- browser-intake-datadoghq.com: Datadog browser data intake for performance monitoring

~ 144 requests and 11.91 MB / 4.16 MB transferred

Positive: You can trial the application without login.

### Grok

grok.com/

- static.cloudflareinsights.com: Cloudflare browser analytics and performance

~ 67 requests and 9.74 MB / 3.06 MB transferred

Unbelievably, Grok comes with only one third-party tracker, but I'm greeted with an error: "Something unexpected happened. We're working to prevent this in the future.". Once again, JShelter at work; Disabling the JavaScript Shield and Fingerprint detector, brought me to a Cloudflare captcha.

- challenges.cloudflare.com: Cloudflare bot protection and challenge verification
- apis.google.com: Google APIs for frontend functionality and services
- ssff.grok.com: Likely a resource or static asset domain for Grok

Once I passed the captcha, I'm on the homepage and with the chat interface; I notice that grok is sending a request every ~1s:

- grok.com/rest/auth/list-teams (fails with a 401 Unauthorized)
- grok.com/api/log_metric

```js
[{"type":"client_fetch_start","endpoint":"unknown"},{"type":"client_fetch_error","endpoint":"unknown","errorCode":"401","source":"api"}]
```

Kind of funny: It knows that I'm not logged-in, yet it's trying to list teams, which fails because I'm not logged-in, and then it reports the fact, that trying to list teams failed, because I'm not logged-in... and it does this every second :)

Notably, Grok packs everything into a single domain: `grok.com/monitoring`, `grok.com/rest`, `grok.com/_next` and so on.

Positive: You can trial the application without login. In fact, in terms of usability, Grok is doing quite well.

## Conclusion

OpenRouter and Grok tie as the least invasive vendors, with Grok requiring minimal tracking and allowing trials without login despite minor technical issues. Venice AI remains the most invasive due to its extensive tracker integrations. NanoGPT and OpenAI balance accessibility with higher tracking risks, while Claude.ai sits mid-tier.

| Rank | Vendor      | Invasiveness Level | Trial Without Login | Notes                                                  |
|------|-------------|--------------------|----------------------|--------------------------------------------------------|
| 1    | Grok        | Least              | Yes                  | Cloudflare analytics/captcha; no obvious trackers      |
| 2    | OpenRouter  | Least              | No                   | Minimal tracking; Clerk auth & Cloudflare insights     |
| 3    | NanoGPT     | Low                | Yes                  | Ad/analytics pixels; minor tracking                    |
| 4    | Claude.ai   | Medium             | No                   | Facebook/Intercom; login required                      |
| 5    | OpenAI      | High               | Yes                  | Heavy Datadog monitoring; JS/Captcha issues            |
| 6    | Venice AI   | Most               | Yes                  | Extensive trackers (Facebook, TikTok, ads, etc.)       |

Do take these with a grain of salt; There's nothing preventing OpenRouter, Grok or any other vendor, from submitting your data to third-parties once it hits their API's. What did surprise me, is how bad Venice AI did - I'm not familiar with them, but for being crypto-first, one would expect them to be more privacy-conscious.

---

On a personal note: This really doesn't have to be; One of my own products [Formshive](https://formshive.com/#/) comes with many of the same features, including authentication, Stripe payments, analytics and so on; Here's what this looks like:

- formshive.com (yes, just one domain)

~ 12 requests and 6.49 MB / 2 MB transferred

_Admittably, I still think that's too much, and I could probably cut it in half._

**Update: 2025-08-05**

Added Grok (which does surprisingly well!).