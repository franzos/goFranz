---
title: "Keycloak Multi-Tenancy: Realms vs Organizations"
description: "I'd heard Keycloak gets weird with many realms. So I benchmarked it. It does."
layout: blog
source:
date: 2026-05-14 12:00:00 +0000
category:
  - Tools
tags:
  - keycloak
  - multi-tenancy
  - performance
  - benchmark
  - identity
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I'd heard repeatedly that "Keycloak gets weird with many realms," but I never had concrete numbers to back it up. If you're building multi-tenant SaaS on Keycloak, you've got two options: the classic *realm-per-tenant* model, or the newer *organizations* feature (KC 26+) that keeps every tenant in a single realm. Conventional wisdom says realms-per-tenant doesn't scale — but by how much, and where does it actually fall over?

So I wrote a small benchmark to find out. A docker-compose stack, a REST seeder, three k6 workloads, and a sweep driver that walks tenant counts from 1 to 1500 in both modes. Everything runs on a single laptop (Ryzen 7640U, 60 GB RAM, Keycloak 26.0 with Postgres). The absolute numbers will shift on other hardware — the *shape* of the curves won't.

## The headline: the admin API collapses

The admin API — listing realms, fetching realm metadata, listing users — is what the admin console hits on every page load. In realms mode it degrades catastrophically: throughput drops **four orders of magnitude** as you add tenants, and p95 latency goes from 2 ms at one tenant to 16.6 s at 500. By 1000 realms, requests just time out.

Organizations mode actually starts *slower* at N=1 — fewer optimisations in the per-org code path — but stays essentially flat all the way through 1500 tenants.

![Admin API throughput: realms vs organizations](/assets/images/blog/keycloak-benchmark_admin-api-throughput.png)

## Provisioning is brutal too

Same story for tenant onboarding. Seeding each tenant through the standard admin REST API (two clients, a handful of roles and groups, ten users), at N=1000 realms mode took **59 minutes**. Orgs mode took **84 seconds** — a 42× gap, and the realms curve is super-linear.

![Seed time: realms vs organizations](/assets/images/blog/keycloak-benchmark_seed-time.png)

## And then it ran itself out of memory

This was the one I didn't expect. Somewhere around 1200 realms, during seeding, Keycloak's `ClearExpiredUserSessions` scheduled task started iterating every realm on every tick — and each call rehydrated the realm cache. Within minutes, process RSS went from ~1 GB to **43 GB** (72 % of the box) and CPU pegged at 600 %. I killed it. Orgs mode at 1500 tenants sits at the same ~880 MB it used at one.

![RSS: realms vs organizations](/assets/images/blog/keycloak-benchmark_rss.png)

## What I take from it

For realm-per-tenant multi-tenancy on a single node, Keycloak isn't viable much past ~500 tenants — and the failure mode beyond that is a hard one (OOM, not just slow). Organizations mode holds up. The user-facing bits — token issuance, JWKS — degrade gracefully in *both* modes, so this is really an admin-plane and provisioning problem, not a login one.

If you need true realm-level isolation, you're not wrong to want it — you just can't do it single-node at scale. Everyone else: reach for organizations.

The full write-up — all the workloads, cold-vs-warm numbers, sizing suggestions, and the caveats (single-node only, plain HTTP, default Postgres) — plus the reproducible setup is in the repo. There's even a Claude Code skill that runs the whole sweep for you.

**[github.com/franzos/keycloak-benchmark](https://github.com/franzos/keycloak-benchmark)**

Do take the absolute throughput figures with a grain of salt — they're from one laptop, one KC release. The realms-vs-orgs delta is the part that travels.
