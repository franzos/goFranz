---
title: "Forseti: the Web UI Ory Doesn't Ship"
description: "Every self-service identity flow for Ory Kratos and Ory Hydra — login, registration, recovery, MFA, OAuth2 consent — plus an admin console, in a single server-rendered Rust binary."
layout: blog
source:
date: 2026-6-27 0:00:00 +0000
category:
  - Tools
tags:
  - rust
  - ory
  - oauth2
  - oidc
  - self-hosted
  - identity
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

Ory's engines are excellent, and completely headless. Stand up [Kratos](https://www.ory.sh/kratos/) for identity and [Hydra](https://www.ory.sh/hydra/) for OAuth2/OIDC and you get certified, battle-tested auth with a clean API and nothing your users can actually look at. Login, registration, recovery, MFA, the OAuth2 consent screen: all of it is your problem. The docs hand you an example UI and wish you luck. So every team that picks Ory ends up writing the same frontend from scratch, and then owning it forever.

I got tired of that, so I built **Forseti**: the part Ory never shipped. One server-rendered Rust binary that talks to Kratos and Hydra and gives your users real screens for every flow, plus an admin console for operators. It's not another identity engine. Rauthy, Kanidm, Keycloak all *are* the engine; Forseti sits in front of engines that are already OpenID-certified and lets you keep them.

That framing matters, because it's the usual complaint about Ory (great APIs, no face) turned into a thing you can just run. You keep Kratos and Hydra doing what they're good at, and Forseti is the front door: login and consent, the whole settings hub, an admin surface, and multi-tenant organizations on top.

## What it looks like

Server-rendered pages, no SPA, no build step. A self-service dashboard and settings hub for users, and an admin console for operators. Click any screenshot to enlarge.

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin:1.5rem 0">
  <figure style="margin:0">
    <a href="/assets/images/blog/forseti-dashboard.png"><img src="/assets/images/blog/forseti-dashboard.png" alt="Forseti self-service dashboard" style="width:100%;border-radius:4px"></a>
    <figcaption style="font-size:.85em;opacity:.7;margin-top:.4rem">The user's dashboard: account health (email, MFA, sessions, linked providers), quick actions, and recent sign-ins.</figcaption>
  </figure>
  <figure style="margin:0">
    <a href="/assets/images/blog/forseti-client-picker.png"><img src="/assets/images/blog/forseti-client-picker.png" alt="Forseti admin OAuth2 client picker" style="width:100%;border-radius:4px"></a>
    <figcaption style="font-size:.85em;opacity:.7;margin-top:.4rem">Admin: new OAuth2 client. Pick an app type or a pre-filled template, so you don't land on a broken combination.</figcaption>
  </figure>
  <figure style="margin:0">
    <a href="/assets/images/blog/forseti-settings.png"><img src="/assets/images/blog/forseti-settings.png" alt="Forseti account settings hub" style="width:100%;border-radius:4px"></a>
    <figcaption style="font-size:.85em;opacity:.7;margin-top:.4rem">The settings hub: profile, password, 2FA, sessions, authorized apps, linked providers, and account deletion.</figcaption>
  </figure>
</div>

## What's in the box

- **Every Kratos flow, server-rendered.** Login, registration, recovery, verification, and the full settings hub: profile, password, MFA/TOTP, passkeys, social logins, active sessions. Nothing left as raw JSON for you to render.
- **An OAuth2 / OIDC bridge.** Login, consent, and logout screens for Hydra's authorization-code flow. That turns your Ory setup into a drop-in OIDC provider for your own apps.
- **App templates for popular self-hosted apps.** One-click, pre-filled OAuth2 client setup for GitLab, Nextcloud, Vaultwarden, Grafana, Immich, and dozens more, with the redirect URIs and per-app OIDC quirks already filled in. Wiring up a new app stops being a scavenger hunt through its docs.
- **An admin console.** Manage identities, sessions, and OAuth2 clients; append-only audit log; live status dashboard; dynamic-client-registration tokens.
- **Organizations.** Multi-tenant orgs with members, invites, per-org branding (colors, logo, a public `/o/{slug}` landing page), and per-org OIDC claims, so one deployment serves many tenants.
- **Linux host auth (preview).** Back your Linux logins off the identity store: NSS `passwd`/`group` plus per-user SSH-key distribution, interactive `ssh`/console login via the OAuth Device Authorization Grant (RFC 8628), and an offline passphrase login for when the server's unreachable.
- **The boring, load-bearing parts.** CSRF on every form, signed cookies, rate-limited DCR, safe response headers, and an account-deletion webhook saga with retries that emits signed RISC events.
- **Light and dark.** A built-in theme toggle (light / dark / follow-system) on every page, plus three built-in themes tenants can pick from.

## Forseti vs the identity crowd

This comparison is a little apples-to-oranges, and that's rather the point. Rauthy, Kanidm, Keycloak and FreeIPA each bring their own protocol stack and datastore; they *are* the engine. Forseti is the UI, admin console, orgs, and governance layer sitting in front of Ory. So the honest question isn't "which engine wins", it's "if you've already bet on Ory, what gives it a face". Accurate as of mid-2026:

| | **Forseti** | **Rauthy** | **Kanidm** | **Keycloak** | **FreeIPA** |
| --- | :---: | :---: | :---: | :---: | :---: |
| **What it is** | UI + governance on Ory | Standalone OIDC provider | Passkey-first IdM | Full IAM server | Linux/Unix domain IdM |
| **Language** | Rust (Axum) | Rust | Rust | Java / JVM | C + Python |
| **OIDC / OAuth2 provider** | Yes (Hydra) | Yes | Yes | Yes | Inbound only |
| **TOTP + passkeys** | Yes (AAL2-enforced) | Passkey-first | Yes | Yes | Yes |
| **Multi-org / tenancy** | Yes † | No | No | Realms + orgs | No |
| **Social login / IdP brokering** | Yes (Kratos) | Yes | No, by design | Yes | Limited |
| **Admin console (web)** | Yes | Yes | CLI-first | Yes | Yes |
| **End-user self-service UI** | Yes (the whole point) | Yes | Yes | Yes | Limited |
| **Datastore** | SQLite / Postgres | Embedded / Postgres | Own embedded DB | External RDBMS | 389 DS (LDAP) |
| **Footprint** | Binary + Ory services | Single binary | Single binary | JVM, ~1-2 GB RAM | Heavy, RPM only |
| **License** | AGPL-3.0 + commercial | Apache-2.0 | MPL-2.0 | Apache-2.0 | GPLv3 |

† Organizations and SAML SSO are Forseti commercial features; the AGPL core runs as a fully working single tenant.

**Where Forseti wins.** If you've already bet on Ory, or you'd rather run a certified OAuth2/OIDC engine than a bespoke one, nothing else gives Kratos and Hydra real screens *and* an admin console *and* first-class multi-tenant organizations. Rauthy, Kanidm and FreeIPA have no organizations model at all; only Keycloak does, and it costs you a JVM and a couple of gigs of RAM.

**Where it doesn't.** Forseti is not a full directory. It can now back Linux logins (a preview feature), but if you need an LDAP server, RADIUS, or Kerberos, that's still Kanidm or FreeIPA territory. If you want the absolute smallest footprint with no Ory alongside, Rauthy or Kanidm are lighter to run, since a full Forseti deployment runs several services (Forseti, Kratos, Hydra, and their Postgres). And if you need the enterprise kitchen sink, Keycloak still does more, at the cost of operating Keycloak. Do take the table with a grain of salt: these projects move.

## Giants run on Ory, so why Forseti?

Fair question, and it's the reassuring part. Ory is what the giants scale with: OpenAI self-hosts Ory Hydra to issue tokens for ChatGPT, which is hundreds of millions of weekly users. So Forseti's throughput ceiling isn't Forseti; it's Ory, the most battle-tested engine in that whole comparison table. Forseti is young, but the thing carrying your auth load underneath is not.

The other half is that Forseti doesn't lock you in. Ory is the contract; Forseti is only the face. Outgrow self-hosting? Move to Ory Network (their cloud) and keep your identities. Want something Forseti doesn't do? Build your own frontend against the exact same Kratos and Hydra APIs and swap it in. Nothing you configure here is a dead end. That makes Forseti a low-risk stepping stone: it gets you real screens today, and if it turns out to be all you ever need, it's easily themeable, so you can make it look like your product rather than a stock login page. A stepping stone that quietly makes for a fine permanent answer.

## Running it

Prebuilt binaries for x86_64 and aarch64 Linux are attached to every release, or you can pull the container from GHCR. Copy `config.example.toml`, point it at your Kratos and Hydra admin endpoints, pick SQLite or Postgres, and run it. The one runtime gotcha: the binary links against `libpq`, so a bare host needs `libpq5` (Debian/Ubuntu) or `libpq` elsewhere; the container already bundles it. The full walkthrough (deployment topology, reverse-proxy cookies and CSRF, secrets, backups) lives in the [operator guide](https://github.com/franzos/forseti/tree/master/docs), so I don't have to keep two copies in sync.

## Where to get it

There's a [product page](/software/forseti/) with the highlights, and the code, releases, and docs are on GitHub at [github.com/franzos/forseti](https://github.com/franzos/forseti). The core is AGPL-3.0; a couple of features (organizations, SAML SSO) live under a commercial gate, but the open core runs as a fully working single tenant, so you can try the whole flow before any of that matters.

It's pre-release and moving, so pin a commit if you build on it. But the shape is what I was after: keep Ory's certified engines, and stop hand-rolling the login page for the tenth time. Forseti is just the front door.
