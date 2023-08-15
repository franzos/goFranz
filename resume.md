---
title: Resume
layout: resume
bg: pattern_029
permalink: /resume/
sitemap:
  exclude: 'yes'
---

## Work Experience

I have over 13 years experience; Here's what I've been working with, over the past year:

<div style="margin-left:2.5rem" markdown="0">
<figure><embed style="max-height:400px" src="https://wakatime.com/share/@franz/864f220d-d347-456d-a511-5e9380433514.svg"></figure>
</div>

For latest projects, kindly refer to my <a href="#independent-work">independent work</a>

### By Technology

Things I have in working memory:

- Javascript from 2011
- Typescript
  - Vue 2, Vue 3, NuxtJS, Vuex, Pinia: from 2016
  - NestJS, Express, TypeORM, Casbin: from 2017
  - React, React Native, Zustand, Redux: from 2021
  - Espruino (BLE): from 2021 (not recently)
- Python
  - Falcon and Flask: from 2017
  - TPM2-TSS: from 2021
- Misc
  - MySQL, MongoDB, Firebase (Push), PostgreSQL, Redis: from 2011
  - Blockchain (Bitcoin, Ethereum), IPFS: from 2016
  - AWS (EC2, Route53, Cloudfront, SES), Heroku, DO, Hetzner (Dedicated): from 2017
  - Docker (Docker Compose), Guix from 2018

I also work with Go frequently, but above is what I interface with on a daily basis.

<hr>

### Independent <location>Lisbon, Portugal</location>
<date>2021-ongoing</date>
<position>Project Manager, Developer</position>

_Work for a client._

- QR/CIBA-OAuth2 IdP with accompanying libraries (TS,Python)
  - High performance backend for central user, device and application authentication, digital signatures (request, respond; multi-party) with push notifications and infrastructure monitoring (logins, device up-time and network, backups)
   <br/><small>NestJS with TypeORM (PostgreSQL), Casbin, Redis cache and AWS S3; Jest and esbuild</small>
  - Responsive admin panel with SSO login and live data monitoring
   <br/><small>Vue 2, Vuex State, Buefy components and SCSS</small>
  - iOS / Android authenticator with CIBA and QR-Login, DSR and push notifications
   <br/><small>React Native, Zustand State, RN Camera, RN QRCode Scanner</small>
  - Android mobile KYC's: One with govt. ID OCR scan and facial recognition, one with USB-powered govt. ID scanner (ACR39U)
   <br/><small>React Native, RN Camera</small>
- Remote health monitoring with smart watch, IOT gateway and supervisor (JS,TS,Python)
  - Application on smart watch for heart rate, temperature and pressure monitoring and transmission (BLE) as well hidden admin menu
    <br/><small>Custom javascript application (Espruino)</small>
  - Bluetooth terminal (SEEED reTerminal) with embedded Linux and automation for BLE data forwarding and VOIP calls via built-in screen
    <br/><small>Embedded Linux Image (X11/Openbox) for ARM, Python for device auth</small>
  - Prescription issuance and distribution with DSR signing-proof
  - Express backend for data storage and retrieval; OIDC auth for users and devices
    <br/><small>NestJS with TypeORM (PostgreSQL), Redis cache</small>
- Decentralized chat and VOIP system with CIBA authentication (Python)
  - Matrix synapse server with custom SSO auth plugin for CIBA
  - Registration automation via CIBA authentication against IdP
- Crypto exchange with trading engine on ETH private chains (TS)
  - Private Ethereum blockchain API with crawler to track transactions, deposit and withdrawals of both coins and ownership of NFT's
  - Exchange API with trading engine and support for limit and market orders
  - Cold-storage solution, with separate wallet server
    <br/><small>All above: NestJS with TypeORM (PostgreSQL) and IPFS for NFT media upload and discovery</small>
  - Admin panel and market front-end with charts, trading mask (Limit/Market), order book, trade history, deposit and withdrawal
    <br/><small>Vue 3, Pinia State, Naive UI components</small>
- NFT market place (TS)
  - Backend API to handle ERC-1155 token creation, buying and selling (multi-currency support for payments, incl. coins and credit cards), deposit and withdrawal
    <br/><small>NestJS with TypeORM (PostgreSQL) and IPFS for file discovery</small>
  - Admin panel and market front-end to create, buy and sell NFT's
    <br/><small>Vue 3, Pinia State, Naive UI components</small>

In addition, I planned and supervised the development of applications and services, that integrate with above infrastructure to facilitate KYC sign-up, remote patient monitoring and voice/video calls:

- Desktop KYC application with facial recognition and govt. ID scan (C++, Qt)
- Desktop application for remote patient monitoring and VOIP (C++, Qt, GStreamer)
- Matrix mobile (Android, iOS) client with CIBA authentication and VOIP support (C++, Qt, GStreamer)

I also maintain related infrastructure, including 30 different servers on AWS EC2 (DB, web-server, BC Nodes & Signer) and a couple of dedicated Docker hosts on Hetzner; Most of which run PantherX OS or Debian, and are managed with a combination of python and go scripts.

### Panther Computer, <location>Lisbon, Portugal</location>
<date>2021-2023</date>
<position>Founder, Project Manager, Developer</position>

_Work on my own project._

- PantherX Central Management for Business (TS)
  - Backend API like IdP for user authentication, monitoring, project management (time tracking, tasks, ...) and desktop integration (sync accounts, secrets, etc.)
    <br/><small>NestJS with TypeORM (PostgreSQL), Casbin, S3</small>
  - Admin panel and user front-end with SSO login, PM, time tracking and so on
    <br/><small>Vue 2, Vuex State, Buefy components and SCSS</small>
- Hub plugin system for integration with Gitlab, GitHub, Email, etc.
  <br/><small>NestJS with TypeORM (PostgreSQL) and IPFS for file discovery</small>
- User (QR and CIBA login) and device identity services (registration and authentication with TPM support) and user application usage tracking by the second
  <br/><small>Custom python applications, tpm2-tss, Activitywatch with crawler</small>
- PantherX System Installer with support for scheme-based config file generation, partitioning (w/wo encryption) and fully automated installation from enterprise config

In addition, I planned and supervised:

- Desktop accounts and secrets service for PantherX (C++, Qt)
- Guix-based package management application for install, update and remove (C++, Qt)
- 100+ other developments for PantherX OS, including desktop applications, system services and libraries (C, C++, Python, Go, Rust, ...)

### Panther Computer, <location>Tehran, Iran</location>
<date>2018-2022</date>
<position>Founder</position>

_Work on my own project._

- Develop system architecture of PantherX OS
- Source, interview and hire qualified C, C++, Python developers to join the team
- Establish internal development workflow based around GitLab Ultimate
- Set development goals, manage individual milestones and keep developers on track
- Set-up and maintain required infrastructure
- Raise funds to sustain operation

<!-- ### SEDVentures Middle East, <location>Tehran, Iran</location>
<date>2018-2020</date>
<position>Co-Founder, Director</position>

- Negotiate investor funding
- Establish internal processes for all common operations such as hiring, reporting
- Research market conditions, evaluate individual ventures based on preset factors
- Negotiate with suppliers on products and parts for individual ventures
- Establish supply-chain for export to Europe: source, ship, pack, distribution
- Oversee development of PantherX OS and Panther Alpha -->

### Sky-Hype AG, <location>Schifflange, Luxembourg</location>
<date>2016-2020</date>
<position>Full-Stack Developer, CTO</position>

- Designed and developed front-end code using Vue.js, Bulma CSS framework
- Implemented i18next based translation with over 10 language pairs
- Developed backend using Nest.js and Typeorm
- Build 3rd party API integration for metasearch based on Flask
- Implemented and worked with Intercom CRM, Mailtrain for email marketing (SES)
- Grown international Facebook group with 100,000+ Users
- Overseen outbound sales to Europe, Middle-East and South-East Asia

### Panther MPC, Inc., <location>Dover, Delaware</location>
<date>Winter 2016</date>
<position>Hustler, Front-End Developer</position>

- Designed and developed front-end code using Bootstrap 3, jQuery
- Worked with Jekyll, Grunt, PHP for custom ranking dashboard
- Investor pitch, initial funding of $36k
- Interviewed, negotiated and hired embedded software developer
- Negotiated terms with China / S-Korea based supplier
- Generated pre-orders from Europe, Middle-East and South-East Asia
- Researched specs for Panther Alpha (ARM board) and Panther OS (ARM Linux)
- Coordinated development of Panther OS for Panther Alpha
- Developed and launched $43k Kickstarter campaign

### HootSuite Media Inc., <location>London, United Kingdom</location>
<date>2014–2016</date>
<position>Community Ambassador</position>

- Extensively used HootSuite to manage client's social media
- Organised local community meetings to educate about social media management
- Provided product feedback and regional insights

### DKKMA Agency, <location>London, United Kingdom</location>
<date>2014-2016</date>
<position>Full-Stack Developer</position>

- Designed and developed countless of client sites using Bootstrap 3
- Developed with Wordpress, Bolt CMS, ExpressionEngine, Jekyll
- Worked on email marketing using Mailtrain, Amazon SES
- Used Metabase to generate performance dashboard based on Google Analytics / MYSQL
- Met with clients, negotiated contacts, managed multiple projects trough completion
- Decide on final copy, final art, finished commercials

<date>2013-2014</date>
<position>Marketing</position>

- Managed relationship with key clients
- Developed new strategies for lead generation (Inbound Marketing)
- Optimized workflow and internal processes
- Approved design mock-ups for development

### Q-Windows, <location>Bangkok, Thailand</location>
<date>2011-2013</date>
<position>Marketing / Outbound Sales</position>

- Designed and developed company website using Wordpress, Bootstrap 2
- Implemented Salesforce CRM, managed outbound sales
- Development of supplier relationship, negotiation of contracts
- Acquisition of projects in the region
- Meet with clients, see projects from initial pitch trough completion

### MJM Networks, <location>Singapore</location>
<date>Winter 2010</date>
<position>Technical Executive</position>

- Development of custom, redundant, dedicated RAID storage for VMWare vSphere
- Administration of Zimbra E-Mail Server for Park Hotel Group (1200+ Users)

### VBH Construction Hardware Co., Ltd, <location>Beijing, China</location>
<date>Early 2010</date>
<position>Marketing Assistant</position>

- Ad design and placement in Chinese magazines

What was Corporate Payment Behaviour in China in 2009? The German Chamber of Commerce in China, Beijing in cooperation with BenCham, the China-Italy Chamber, the French Chamber, and SwissCham Beijing

## Education

### Taylor's University College, <location>Kuala Lumpur, Malaysia</location>
<date>2008–2010</date>
<position>International Business</position>

- Carpie Diem, Member of Editorial Board Committee

### German European School, <location>Singapore</location>
<date>2006–2008</date>
<position>High School</position>

## Certification

### Hubspot Academy, <location>Online</location>
<date>Summer 2015</date>
<position>Inbound Marketing Certification</position>

- Website optimization
- Landing page anatomy
- Inbound sales skills
