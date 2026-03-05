---
title: "OpenPGP Web Key Directory on S3 and CloudFront"
summary: "Setting up WKD so email clients can automatically find your PGP key — hosted on S3 with CloudFront."
layout: blog
source:
date: 2026-03-05 0:00:00 +0000
category:
  - Tools
tags:
  - gpg
  - security
  - aws
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

If you've ever exchanged PGP-encrypted email, you know the awkward dance: you need someone's public key before you can write to them, and they need yours. Keyservers exist, but they're clunky and not everyone publishes there. Web Key Directory (WKD) is a simpler approach — your email client fetches the key directly from your domain over HTTPS. No keyserver, no manual import.

Thunderbird, KMail, GnuPG, Proton Mail, and a growing list of clients support it out of the box. Once set up, anyone composing an encrypted email to you gets your key automatically.

Here's how I set it up for `mail@gofranz.com`, hosted on S3 with CloudFront.

## How WKD works

WKD maps an email address to a URL. The local part (before the `@`) gets SHA-1 hashed and Z-Base-32 encoded into a 32-character string. That string becomes the filename, served from a well-known path on your domain.

There are two methods:

| Method | URL pattern |
|---|---|
| **Direct** | `https://example.com/.well-known/openpgpkey/hu/<hash>?l=<local>` |
| **Advanced** | `https://openpgpkey.example.com/.well-known/openpgpkey/example.com/hu/<hash>?l=<local>` |

The direct method is simpler — no subdomain, no extra TLS certificate. Most clients try the advanced method first, then fall back to direct.

## Prerequisites

- A domain with HTTPS (required — WKD won't work without it)
- GnuPG 2.1.12+ installed locally
- Your PGP key in your local keyring
- An S3 bucket + CloudFront distribution serving your site

## Step 1: Get your WKD hash

GnuPG can compute the hash for you:

```bash
gpg --with-wkd-hash -k yourmail@example.com
```

In the output, look for a line formatted as `hash@domain` right below your uid — the part before the `@` is your WKD hash. For `mail@gofranz.com`, mine is `dizb37aqa5h4skgu7jf1xjr4q71w4paq`.

## Step 2: Create the directory structure

```bash
mkdir -p .well-known/openpgpkey/hu
touch .well-known/openpgpkey/policy
```

The empty `policy` file signals that WKD is available on this domain. Without it, clients won't look further.

## Step 3: Export your key

Export the **binary** format — not ASCII-armored:

```bash
gpg --export yourmail@example.com > .well-known/openpgpkey/hu/<your-hash>
```

## Step 4: Jekyll configuration

If you're using Jekyll (or any static site generator that ignores dotfiles), make sure `.well-known` gets included in the build output. For Jekyll, add to `_config.yml`:

```yaml
include:
  - .well-known
```

## Step 5: S3 upload with correct Content-Type

S3 won't guess the right content type for an extensionless binary file. Upload the WKD files with an explicit content type **before** your general `s3 sync` — this way sync sees the files already exist and skips them, preserving the correct metadata:

```bash
aws s3 cp _site/.well-known/openpgpkey/hu/ s3://your-bucket/.well-known/openpgpkey/hu/ \
  --recursive --content-type "application/octet-stream" --profile your-profile
aws s3 sync _site/ s3://your-bucket/ --delete --profile your-profile
```

## Step 6: CloudFront CORS headers

WKD requires `Access-Control-Allow-Origin: *` on responses. CloudFront doesn't add this by default.

1. Go to **CloudFront → Policies → Response headers policies** and create a new policy (I called mine `WKD-CORS`)
2. Enable **CORS** and set `Access-Control-Allow-Origin` to all origins
3. Go to your **Distribution → Behaviors** and create a new behavior:
   - Path pattern: `/.well-known/openpgpkey/*`
   - Origin: your S3 origin
   - Response headers policy: `WKD-CORS`

## Step 7: DNS — wildcard gotcha

If your domain has a wildcard DNS record (`*.example.com`), clients trying the advanced method will get a response from the wildcard instead of a proper "not found." This can break the fallback to the direct method.

The fix: add a TXT record for `_openpgpkey.example.com` (the value can be empty). This tells clients that the advanced method isn't available, and they should use direct.

## Verify

Deploy your site, invalidate CloudFront, and test:

```bash
gpg --auto-key-locate clear,wkd --locate-keys yourmail@example.com
```

There are also web-based checkers — [wkd.dp42.dev](https://wkd.dp42.dev/) (open-source) and [webkeydirectory.com](https://webkeydirectory.com/). Note that some checkers report a missing CORS header even when it's working — CloudFront only returns `Access-Control-Allow-Origin` when the request includes an `Origin` header, which is standard behavior. Real email clients send this header.

## Who supports WKD?

Adoption is broader than you might expect:

| Software | Type | Since |
|---|---|---|
| GnuPG | CLI | 2.1.12 (2016) |
| Thunderbird | Email client | 78 (2020) |
| KMail | Email client | ~2018 (via GnuPG) |
| Delta Chat | Email client | ~2022 |
| Mailvelope | Browser extension | 4.x (~2020) |
| Proton Mail | Provider | ~2020 |
| Posteo | Provider | ~2019 |
| mailbox.org | Provider | ~2020 |

Proton Mail is probably the largest deployment — every `@protonmail.com` and `@proton.me` address has WKD set up automatically.

## Caveats

- **One key per email.** WKD serves a single key per address. If you have multiple keys, only one gets published.
- **No revocation propagation.** If you revoke your key, you need to manually update or remove the file. There's no automatic mechanism.
- **HTTPS required.** Self-signed certificates won't work.
- **The advanced method needs a subdomain.** If you want to support it, you need `openpgpkey.example.com` with a valid TLS certificate. For most personal domains, the direct method is sufficient.

It took about 15 minutes to set up, and now anyone with a WKD-capable client can find my key automatically. One less reason to skip encryption.
