---
layout: base
title: "Remote Patient Monitoring System"
date: 2025-07-07 00:00:00 +0200
client: "onesnow"
bg: thailand
cover: ones-01.jpg
tags: "development"
introduction: "Monitoring at-home patients remotely."
featured: true
---

## The Challenge

The company wanted to implement a KYC-based identity system that securely authenticates users, to give them access to a wide variety of first-party, and third-party applications.

## Implementation

Overview of identity system and remote patient monitoring system.

### Identity System

The identity system consists of several core components working together to provide secure authentication and document management. The **(A) IDP server** provides device authentication, CIBA (Client Initiated Backchannel Authentication), and QR authentication capabilities, while the **(B) document server** facilitates digital signatures for official documents. 

Supporting these core services, the **(C) push server** sends notifications to clients on behalf of the IDP and document servers to inform about CIBA requests or document signing requests. The **(D) stats server** collects system health statistics for monitoring and maintenance.

Users interact with the system through the **(E) mobile application**, which allows them to sign up and authenticate via the IDP server while securely storing their cryptographic keys in the device's secure enclave.

The system implements **(F) a progressive 3-level KYC verification process**: Level 1 requires only basic information (First Name, Last Name, Phone, Email), Level 2 adds government-issued ID verification through mobile KYC on an authorized device, and Level 3 requires in-person verification with a government-issued ID where the user is verified by an authorized person.

<!-- alt: Diagram showing core Identity System components and KYC registration levels flow -->
<div class="mermaid">
graph TB
    %% Identity System Components
    IDP["(A) IDP Server<br/>Device Auth, CIBA, QR Auth"]
    DOC["(B) Document Server<br/>Digital Signatures"]
    PUSH["(C) Push Server<br/>Notifications"]
    STATS["(D) Stats Server<br/>Health Monitoring"]
    MOBILE["(E) Mobile App<br/>User Auth & Signing"]
    
    %% KYC Levels
    subgraph "KYC Registration Levels"
        L1["(F1) Level 1: Basic Info<br/>Name, Phone, Email"]
        L2["(F2) Level 2: Mobile KYC<br/>Govt ID + Device Auth"]
        L3["(F3) Level 3: In-Person<br/>Verified by Authority"]
    end
    
    %% External Integration Points
    EXT_APPS[External Applications<br/>Patient Monitoring, etc.]
    EXT_DOCS[External Document Requests<br/>Prescriptions, etc.]

    %% Internal Connections
    IDP -.-> DOC
    IDP -.-> PUSH
    IDP -.-> STATS
    MOBILE <--> IDP
    MOBILE <--> DOC
    PUSH --> MOBILE
    
    %% KYC Flow
    MOBILE --> L1
    L1 --> L2
    L2 --> L3
    L3 -.-> IDP
    
    %% External Integrations
    EXT_APPS <-->|OIDC/CIBA Auth| IDP
    EXT_DOCS <-->|Digital Signing| DOC
    PUSH -->|Notifications| EXT_APPS

    %% Styling
    classDef identity fill:#e1f5fe
    classDef kyc fill:#e8f5e8
    classDef external fill:#fff3e0

    class IDP,DOC,PUSH,STATS,MOBILE identity
    class L1,L2,L3 kyc
    class EXT_APPS,EXT_DOCS external
</div>

To ease access to the identity system, a variety of libraries have been developed:

- C++, Rust, Typescript, Python for CIBA (Client Initiated Backchannel Authentication) and OIDC (OpenID Connect) authentication
- C++, Rust, Typescript for document interaction: upload, sign, verify
- Rust, Typescript libraries for push notifications as they are primarily coming from the identity system
- Rust library for stats collection (run on Server, KYC)

#### Technical Stack

- IDP server: NestJS (`node-oidc-provider`), PostgreSQL, Redis
- IDP server frontend: Vue.js 2
- Documents, Push, Stats servers: Rust (Actix-web)
- Documents frontend: React
- [Mobile authenticator](/work/mobile-authenticator/): React Native (Android, iOS)
- Mobile KYC (L2): React Native (Android, needs USB access for ID scanning)
- Desktop KYC (L3): C++/Qt

The Desktop KYC runs on Guix and is configurable remotely.

The servers, from IDP to Documents, Push and Stats are running on a number of dedicated servers, behind a haproxy load balancer; I've written about a simple version of this previously in [
Reduced AWS Bills by 75% with Docker](/blog/reduced-aws-bills-by-75-percent-with-docker-copy/).

### Applications

The primary use-case for the identity system: A remote patient monitoring system for at-home patients with mobility issues and monitoring needs, which integrates with the identity system for secure authentication and prescription management.

#### Patient Monitoring System

<!-- alt: Diagram showing Patient Monitoring System components and data flows -->
<div class="mermaid">
graph TB
    %% Patient Side
    subgraph "Patient Environment"
        WATCH["(1) Smartwatch<br/>HR, Activity, Temp, Pressure"]
        BP["(2) Blood Pressure Cuff<br/>BP & HR"]
        GATEWAY["(3) Patient Gateway<br/>SEEED reTerminal<br/>BLE Client + Camera/Speaker"]
    end
    
    %% Healthcare Side
    subgraph "Healthcare Providers"
        MONITOR["(5) Monitoring Station<br/>Doctor Interface"]
        SUPERVISOR["(7) Supervisor Station<br/>Patient Assignment"]
        NURSE["Nurse Device<br/>Prescription Pickup"]
    end
    
    %% Infrastructure
    subgraph "System Infrastructure"
        SERVER["(4) Patient Data Server<br/>REST API + WebSocket"]
        SIGNAL["(6) WebRTC Signaling Server"]
        TURN["(6) TURN Server<br/>coturn"]
        PHARMACY["Pharmacy System<br/>Prescription Handling"]
    end
    
    %% Identity System Integration
    subgraph "Identity Integration"
        IDP_INT[IDP Server<br/>Authentication]
        DOC_INT[Document Server<br/>Prescription Signing]
        MOBILE_INT[Mobile App<br/>Doctor Signing]
    end

    %% Patient Data Flow
    WATCH -->|BLE| GATEWAY
    BP -->|BLE| GATEWAY
    GATEWAY -->|REST| SERVER
    
    %% Healthcare Access
    MONITOR <-->|REST/WebSocket| SERVER
    SUPERVISOR -->|Patient Assignment| SERVER
    
    %% WebRTC Communication
    GATEWAY <-->|WebRTC| SIGNAL
    MONITOR <-->|WebRTC| SIGNAL
    SIGNAL <--> TURN
    
    %% Prescription Flow
    MONITOR -->|Create Prescription| DOC_INT
    DOC_INT -->|Sign Request| MOBILE_INT
    DOC_INT -->|Signed Document| PHARMACY
    PHARMACY -->|Pickup Notification| NURSE
    
    %% Authentication Flow
    SERVER <-->|OIDC/CIBA| IDP_INT
    MONITOR <-->|Doctor Auth| IDP_INT
    NURSE <-->|Auth| IDP_INT
    PHARMACY <-->|Document Verification| DOC_INT

    %% Styling
    classDef monitoring fill:#f3e5f5
    classDef infrastructure fill:#fff3e0
    classDef identity fill:#e1f5fe

    class WATCH,BP,GATEWAY,MONITOR,SUPERVISOR,NURSE monitoring
    class SERVER,SIGNAL,TURN,PHARMACY infrastructure
    class IDP_INT,DOC_INT,MOBILE_INT identity
</div>

**Patient Data Collection**: The system begins with patient-side devices that continuously gather vital signs and health metrics. A **(1) smartwatch** collects heart rate, activity levels, environmental temperature and pressure, while a **(2) blood pressure cuff** measures blood pressure and heart rate. Both devices transmit their data via Bluetooth Low Energy (BLE) to the central **(3) patient gateway** - a SEEED reTerminal device that serves as the communication hub. This gateway not only collects and forwards the health data to the server via REST API but also features an integrated camera and speaker system to enable two-way WebRTC video calls with healthcare providers.

**Healthcare Provider Access**: On the healthcare side, the **(4) patient data server** makes all collected information available to authenticated devices and users through OIDC and CIBA protocols, providing both REST API and WebSocket connectivity for real-time data access. 

Healthcare professionals use a **(5) monitoring station** registered with the server to access patient data (requiring doctor role authorization via CIBA). From this station, doctors can not only monitor patient vitals but also initiate video calls with patients and create digital prescriptions. 

The prescription workflow is streamlined: doctors fill out prescriptions on the monitoring station, then sign them digitally using their mobile device and secure key, after which the signed documents are automatically submitted to the pharmacy system and assigned nurses are notified for prescription pickup.

**System Infrastructure**: The technical backbone includes a **(6) WebRTC communication system** with a dedicated signaling server and TURN server (coturn) to facilitate secure video calls between patients and healthcare providers. Additionally, **(7) supervisor stations** manage the assignment of patients to specific monitoring stations, ensuring proper care coordination and oversight throughout the monitoring process.

##### Technical Stack

- Server: NestJS, PostgreSQL, Redis
- Server frontend: Vue.js 2
- Monitoring & Supervisor stations: C++/Qt
- Patient Gateway
  - WebRTC client: C++/Qt with GStreamer backend
  - Terminal Launcher: C++/Qt
- WebRTC signaling server: Rust


The Patient Gateway runs Debian, and packages are delivered as Guix-packages as described here: [GUIX on slow, embedded devices](/blog/guix-on-slow-embedded-devices/). It's powered by a Raspberry Pi 4 compute module and handles monitoring and video calls without breaking a sweat.

## Take-Away

This is by far the most complex system I've worked on in my career, and has been an incredible learning experience. Hiring and leading the team, has made me a better manager, and planning-out, and developing the architecture, has deepened my understanding of complex systems and particularly, what to do, and what not to do.

These insights may seem simplistic but:

- Don't over-engineer; Keep it simple.
- Scope-creep is real; Stick to the plan.
- Spend more time planning, than developing.
- Be specific when instructing others.