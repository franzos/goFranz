---
title: Resume
layout: resume
bg: pattern_029
permalink: /resume/
sitemap:
 exclude: 'yes'
---

I'm a systems architect and technical leader who ships. Currently Senior Identity Engineer at TWIN (IOTA Foundation), shipping OID4VP, SD-JWT VC, and a KERI/vLEI ↔ IOTA DID bridge for global trade. Principal engineer at Softmax before TWIN - built the digital identity platform now backing KYC across 10+ partner products, IoT remote patient monitoring (BLE/WebRTC), and a regulated crypto exchange. 12+ years building products end-to-end and guiding the teams that deliver, sometimes as the founder.

My non-traditional path through international business and self-directed learning - 15+ years across Singapore, Thailand, Malaysia, China, Iran, UAE, Turkey, and Portugal - has made me stronger. I understand users, markets, and the business impact of technical decisions. I design and build secure, scalable platforms end to end - turning ambiguous business goals into simple, reliable systems. I'm at my best in high-ownership, fast-moving environments - because this is more than a job to me.

## TECHNOLOGY STACK

* **Identity & Trust:** OID4VP/OID4VCI, SD-JWT VC (selective disclosure, KB-JWT holder binding), DCQL, JARM, W3C Verifiable Credentials (issuer + verifier), Bitstring Status List, KERI/ACDC/IPEX, vLEI, DID (`did:iota`, `did:webs`), OIDC/CIBA, OAuth 2.0, EUDIW (HAIP profile), trust frameworks, Casbin (ABAC/RBAC), Argon2, X.509/PKIX
* **Languages:** TypeScript/JavaScript, Rust, Python, Move (IOTA)
* **Platforms:** Node.js (Fastify, NestJS, Express), Rust (Actix Web, Diesel), Next.js (App Router), React, Vue, React Native
* **Infrastructure:** PostgreSQL, MySQL, ClickHouse, Redis, HashiCorp Vault, Docker, AWS, Guix (reproducible builds)
* **Other Protocols:** WebRTC, JWS/JWE/JWT, WebSockets, Nostr

## WORK EXPERIENCE

<div class="item-header">
    <h3>Senior Identity Engineer at TWIN (IOTA Foundation)</h3>
    <h3>2025 - Present</h3>
</div>

*Building digital identity infrastructure for global trade - bridging GLEIF/vLEI, EU eID, and country-specific KYC with decentralized identity on IOTA.*

* **GLEIF vLEI ↔ IOTA DID Two-Way Binding - no off-the-shelf bridge between these trust roots, so I built one:**
    * Bidirectional cryptographic linkage between **GLEIF's KERI/vLEI ecosystem** and **IOTA DIDs** (`did:iota`, `did:webs`).
    * Issued a self-issued **Designated Aliases ACDC** anchored in the Legal Entity's **KEL/TEL**, plus an on-chain **W3C VC JWT** embedding the KERI anchor seal (KEL `anc` + TEL `iss` SAIDs), with three independent on-chain authority checks.
    * Built full-stack: **Move smart contract** (VleiAttestation), Express/Node backend, **React 19 + Vite** frontend running **`signify-ts` directly in the browser** (keys never leave the device), Sally verifier integration.

* **OID4VP Verifier on the HAIP profile - interop-tested against the EUDI Reference Wallet:**
    * Caught three bugs in spec review - silent **KB-JWT** skip, **JWE** dual-version trap, **DCQL** PII leak.
    * Implemented **`x509_hash` client ID scheme**, **SD-JWT VC** verification with **KB-JWT** holder-binding, **DCQL** queries, and **JARM `direct_post.jwt`** (ECDH-ES JWE).

* **Identity Management Platform - features I delivered end-to-end on the team:**
    * Backend (**TypeScript, Fastify, TWIN framework**) and frontend (**Next.js 16 App Router, React 19, TanStack Query, Tailwind, shadcn/ui**).
    * Shipped a **W3C VC** issuance pipeline (OID4VCI-aligned) - schema-validated templates, status-list revocation, auto-issuance after KYC/KYB.
    * Built a **plugin-based KYC/KYB verification provider architecture**, with first concrete implementation against **KRA (Kenya Revenue Authority) PIN + OTP**.
    * **Casbin ABAC + RBAC policy engine** with rank-derived hierarchies and circular-reference guards - replaced ad-hoc admin checks across the codebase. `usePermissions` hook + server-side enforcement on the frontend.
    * **GDPR right-to-erasure** with cascading deletion across DID documents, HashiCorp Vault key wipe, and audit-log scrubbing. **Argon2** + **ALTCHA** PoW captcha + sliding-window rate limiting + hashed identifier storage hardening.

* **Notary Trust Anchor Service - whitepaper to PoC:**
    * Plugin-based issuer architecture: three-artifact issuance (W3C VC + Soulbound Move object + IOTA Hierarchies entry), multi-artifact revocation, signed verification-lineage claims.
    * Defined the `INotaryProvider` plugin contract (`initiate / advance / finalize` lifecycle, per-plugin freshness/binding policy); proposed a new `attestationAdd` Move op upstream to **IOTA Hierarchies**.

<div class="item-header">
    <h3>Principal Engineer / Technical Lead at Softmax Co., Ltd</h3>
    <h3>2021 - Present</h3>
</div>

*Built a digital identity platform for government use - now backing KYC across 10+ partner products. Currently advisory.*

* **OIDC/CIBA Identity Platform:**
    * Backend in **TypeScript (NestJS)** and **Rust (Actix Web)**: authentication, digital signatures, push notifications.
    * SDK libraries across **TypeScript, Rust, C++, PHP, Python** for auth flows, digital signatures, push notifications.
    * Led engineering, ran technical integrations, and served as primary integration contact for partner orgs.

* **Delivered IoT Healthcare Solution:**
    * **BLE application for Bangle.js** smartwatch + clinical dashboards for real-time patient monitoring.
    * Patient gateway terminal: vital-signs REST API, WebSocket + WebRTC monitoring interface.

* **Launched Crypto Exchange & NFT Marketplace:**
   * **ERC-1155 NFT platform** with integrated KYC for regulated digital asset trading.
   * Multi-currency exchange with wallet management and order book logic.

* **99.9% Platform Uptime over 24 Months:**
    * Reproducible builds + deployment via **Guix** - no configuration drift.
    * Containerized deployment (Docker, custom scripts) for **30+ microservices** with monitoring.

<div class="item-header">
    <h3>Founder at goFranz</h3>
    <h3>2019 - Present</h3>
</div>

*Solo technical founder - five products, all still running, all paying their own bills. Nights and weekends since taking on TWIN.*

* **Checkoutbay.com** - API-first e-commerce with multi-warehouse inventory.
* **Formshive.com** - Privacy-focused form backend with spam filtering for developers.
* **GPTMuse.com** - Privacy-first AI platform: pay-per-use access to ChatGPT, Claude, Gemini.
* **PantherX.org** - Lightweight Linux distribution on GNU Guix; declarative system configuration.
* **nostr-ts** - Open-source TypeScript SDK for the Nostr protocol.

<div class="item-header">
    <h3>Co-founder & CTO at Sky-Hype AG (Global real estate social platform)</h3>
    <h3>2016 - 2020</h3>
</div>

*Co-founded a global real estate social platform - ran the build, the hiring, the investor pitches, and early customer outreach. Wound down in 2020.*

* **Scaled platform to 50,000 daily active users.** Built the social/search platform from scratch - Vue.js frontend, NestJS/Flask backend.
* **Secured seed funding** - pitched investors, defined technical roadmap.
* Onboarded realtors by running technical integrations personally; built engineering + sales teams.

<div class="item-header">
    <h3>Software Engineer at DKKMA Ltd.</h3>
    <h3>2013 - 2016</h3>
</div>

*Hands-on client work - from first call to delivery.*

20+ custom web projects (Bootstrap, CMS integrations); analytics dashboards (Metabase, Google Analytics, MySQL).

<div class="item-header">
    <h3>Earlier Experience</h3>
    <h3>2010 - 2013</h3>
</div>

Infrastructure and integration roles at Q-Windows Thailand, MJM Networks Singapore, and VBH Hardware China.
