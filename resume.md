---
title: Resume
layout: resume
bg: pattern_029
permalink: /resume/
sitemap:
 exclude: 'yes'
---

I'm a systems architect and technical leader who ships. The protocols are the easy part now; what's scarce is judgment: knowing what to build, what it costs you in a year, and when the confident answer is the wrong one. Currently Senior Identity Engineer at TWIN (IOTA Foundation), shipping OID4VP, SD-JWT VC, and a KERI/vLEI ↔ IOTA DID bridge for global trade. Before TWIN, principal engineer at Softmax: the digital identity platform now backing KYC across 10+ partner products, IoT remote patient monitoring (BLE/WebRTC), and a regulated crypto exchange. 14 years building products end to end and guiding the teams that deliver, sometimes as the founder.

My non-traditional path through international business and self-directed learning - 15+ years across Singapore, Thailand, Malaysia, China, Iran, UAE, Turkey, and Portugal - taught me to read users, markets, and the business impact of a technical call. I design and build secure, scalable platforms end to end, turning ambiguous goals into simple, reliable systems. AI makes me fast, but the aim is mine: I'm the driver, not the passenger. I'm at my best in high-ownership, fast-moving environments, because this is more than a job to me.

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

*Building the digital identity platform for global trade - bridging GLEIF/vLEI, EU eID, and country-specific KYC with decentralized identity on IOTA.*

* **GLEIF vLEI ↔ IOTA DID two-way binding - no off-the-shelf bridge between these trust roots, so I built one:**
    * Bidirectional cryptographic linkage between **GLEIF's KERI/vLEI ecosystem** and **IOTA DIDs** (`did:iota`, `did:webs`): a self-issued **Designated Aliases ACDC** anchored in the Legal Entity's **KEL/TEL**, plus an on-chain **W3C VC JWT** carrying the KERI anchor seal (KEL `anc` + TEL `iss` SAIDs), verified by three independent on-chain authority checks.
    * Full-stack: **Move contract** (VleiAttestation), Express/Node backend, **React 19 + Vite** frontend running **`signify-ts` in the browser** (keys never leave the device), Sally verifier integration.

* **Identity platform on Keycloak - Keycloak as the OIDC authorization server for the TWIN identity stack:**
    * Extended Keycloak with a custom **SPI** for **HashiCorp Vault**-backed token signing.
    * **Multi-tenant** IdP: per-realm and shared-realm tenancy, machine-to-machine service accounts
    * Standard OIDC hardening: **`private_key_jwt`** client auth (RFC 7523), refresh-token rotation; JWKS verification at the edge.
    * **Casbin ABAC + RBAC** authorization, **GDPR right-to-erasure**, and a headless provisioning CLI.

* **TWIN Notary - a credential trust anchor, whitepaper to a running service:**
    * **OID4VCI 1.0 Final** issuer (pre-authorized code flow) minting **W3C VCDM 1.1** `jwt_vc_json` credentials signed as a **`did:iota`** via Vault, plus an **OID4VP 1.0 Final** verifier (DCQL) for permissionless presentation.
    * **Dual-lane revocation**: W3C **Bitstring Status List** over HTTPS and on-chain **RevocationBitmap2022** in the issuer DID document, with configurable strict/resilient policy.
    * Pluggable **`INotaryProcess`** core (`initiate / advance / finalize`) with two backings - contract attestation and **KRA (Kenya Revenue Authority) / KYB** business verification - plus signed **verification-lineage** claims across renewals.

* **OID4VP verifier on the HAIP profile - interop-tested against the EUDI Reference Wallet:**
    * Implemented the **`x509_hash`** client ID scheme, **SD-JWT VC** verification with **KB-JWT** holder binding, **DCQL** queries, and **JARM `direct_post.jwt`** (ECDH-ES JWE).
    * Caught three bugs in spec review: a silent **KB-JWT** skip, a **JWE** dual-version trap, and a **DCQL** PII leak.

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
