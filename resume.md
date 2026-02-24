---
title: Resume
layout: resume
bg: pattern_029
permalink: /resume/
sitemap:
 exclude: 'yes'
---

I'm a systems architect and technical leader who ships. With 12+ years building products from concept to scale, my non-traditional path through international business and self-directed learning—including 15+ years living and working across Asia, Middle East and Europe (Singapore, Thailand, Malaysia, China, Iran, UAE, Turkey, Portugal)—has made me stronger: I understand users, markets, and the business impact of technical decisions. I excel at translating complex specifications into working systems—whether implementing WebRTC from RFCs or OIDC/CIBA from standards documents—while building and guiding teams to deliver. I design and build secure, scalable platforms end to end—translating ambiguous business goals into simple, reliable systems. I thrive in high-ownership, fast-moving environments because this is more than a job to me.

## CORE COMPETENCIES

* **Technical Leadership:** Drive architecture decisions, lead engineering teams, enable third-party integrations
* **Specification Implementation:** Translate complex standards into production systems and SDKs
* **End-to-End Ownership:** Architecture → implementation → deployment → scale
* **Business Impact:** Bridge technical and business needs from startup to enterprise
* **Global Perspective:** 15+ years across Asia, Middle East, Europe - proven remote collaboration

## TECHNOLOGY STACK

* **Languages:** TypeScript/JavaScript, Rust, Python
* **Platforms:** Node.js (NestJS, Express), Rust (Actix Web, Diesel), React, Vue, React Native
* **Infrastructure:** PostgreSQL, ClickHouse, Redis, Docker, AWS, Guix (reproducible builds)
* **Protocols & Standards:** OIDC/CIBA, OAuth 2.0, WebRTC, JWS/JWT, WebSockets, Nostr
* **Approach:** Read specifications, leverage proven libraries, focus on production reliability over algorithmic complexity

## WORK EXPERIENCE


<div class="item-header">
    <h3>Digital Identity Engineer at TWIN (IOTA)</h3>
    <h3>2025 - Present</h3>
</div>

*Building digital identity infrastructure for global trade—connecting diverse trust sources (GLEIF/vLEI, EU eID, country-specific KYC) with decentralized identity on IOTA.*

* **Built GLEIF vLEI–IOTA DID Linkage PoC:**
    * Designed and implemented a system that cryptographically links **GLEIF vLEI credentials (KERI/ACDC)** to **IOTA DIDs**, enabling bidirectional identity verification for legal entities.
    * Built full-stack application (**TypeScript, React 19, Express**) with browser-side KERI signing via signify-ts and on-chain attestation NFTs in **Move**.
    * Integrated GLEIF trust chain (Root → QVI → Legal Entity) with Sally verifier webhooks and IPEX credential exchange.

* **Architected Identity Management Platform:**
    * Developed enterprise-grade onboarding, authentication, and credential management system on the **TWIN framework** (**TypeScript, Node.js**).
    * Implemented secure auth with **argon2id** hashing, entropy-based password validation, and extensible **KYC provider framework**.
    * Built credential request/approval workflows, organization management with role-based access, and comprehensive audit logging.

* **Designed OID4VP Integration Architecture:**
    * Researched and architected **OpenID for Verifiable Presentations (OID4VP)** integration for credential-based SSO, replacing password auth with wallet-based login using **SD-JWT VCs**.
    * Evaluated library landscape and designed OIDC bridge pattern enabling downstream services to remain unchanged.

<div class="item-header">
    <h3>Principal Engineer / Technical Lead at Softmax Co., Ltd</h3>
    <h3>2021 - Present</h3>
</div>

*Brought in to architect a new foundational platform from concept to execution, defining government-level security specifications and leading the hands-on implementation.*

* **Architected Foundational Digital Identity Platform:**
    * Enabled secure KYC across 10+ partner products by building government-compliant identity platform leveraging **OIDC/CIBA**.
    * Engineered backend services in **TypeScript (NestJS) and Rust (Actix Web)**, creating a robust and reusable ecosystem for authentication, digital signatures, and notifications.
    * Accelerated partner adoption by developing comprehensive SDK libraries across **TypeScript, Rust, C++, PHP, and Python** for auth flows, digital signatures, and push notifications.
    * Led engineering team and served as primary technical liaison for third-party integrations, ensuring successful platform adoption across partner organizations.

* **Delivered Full-Stack IoT Healthcare Solution:**
    * Enabled real-time patient monitoring by developing custom **BLE application for Bangle.js** smartwatch and clinical dashboards.
    * Built patient gateway terminal processing vital signs via REST API and WebSocket-powered monitoring interface.

* **Launched Compliant Crypto Exchange & NFT Marketplace:**
   * Developed **ERC-1155 NFT platform** with integrated KYC, ensuring regulatory compliance for digital asset trading.
   * Implemented multi-currency exchange with secure wallet management and order book logic.

* **Achieved 99.9% Platform Uptime (24 months):**
    * Implemented fully reproducible build and deployment pipelines using **Guix**, eliminating configuration drift.
    * Engineered containerized deployment pipeline (Docker, custom scripts) for 30+ microservices with comprehensive monitoring.

<div class="item-header">
    <h3>Founder at goFranz</h3>
    <h3>2019 - Present</h3>
</div>

*Operating as solo technical founder, validating market needs through rapid prototyping and direct user feedback.*

* **Checkoutbay.com** - API-first e-commerce addressing demand for flexible, multi-warehouse inventory management.
* **Formshive.com** - Privacy-focused form backend service with advanced spam recognition for developers.
* **GPTMuse.com** - Privacy-first AI platform providing unified access to ChatGPT, Claude, Gemini with pay-per-use pricing.
* **PantherX.org** - Lightweight Linux distribution built on GNU Guix, enabling declarative system configuration.
* **nostr-ts** - Open-source TypeScript SDK for the decentralized Nostr protocol, supporting community growth.

<div class="item-header">
    <h3>CTO / Software Engineer at Sky-Hype AG (Global real estate social platform)</h3>
    <h3>2016 - 2020</h3>
</div>

*As founding technical partner and CTO, translated deep real estate market insights into a global technology platform.*

* **Scaled platform to 50,000 daily active users** by architecting the social/search platform from ground up using Vue.js frontend and NestJS/Flask backend.
* **Secured seed funding and partnerships** by pitching to investors, co-developing financial models, and defining technical roadmap.
* **Drove realtor adoption** by building and leading cross-functional teams (engineering, sales), personally conducting technical integrations.
* **Accelerated organic growth** through automated content curation systems and strategic feature development.

<div class="item-header">
    <h3>Software Engineer at DKKMA Ltd.</h3>
    <h3>2013 - 2016</h3>
</div>

* Delivered 20+ custom web projects for diverse clients using Bootstrap, CMS integrations, and custom development.
* Built analytics dashboards (Metabase, Google Analytics, MySQL) for data-driven decision making.
* Managed complete project lifecycle from client scoping to production deployment.

<div class="item-header">
   <h3>Earlier Experience</h3>
   <h3>2010 - 2013</h3>
</div>

Infrastructure and integration roles at Q-Windows Thailand, MJM Networks Singapore, and VBH Hardware China.
