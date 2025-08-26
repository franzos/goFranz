---
title: "Load Testing and Scaling (Formshive with Apache Bench)"
summary: "Load testing and scaling architecture analysis for a web application using Apache Bench, exploring performance bottlenecks and scaling strategies."
layout: blog
source:
date: 2025-08-11 0:00:00 +0000
category:
  - Tools
tags:
  - apache-bench
  - performance
  - scaling
  - formshive
  - load-testing
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

Today I wanted to have a closer look at how my web application Formshive performs in different scenarios. It's probably been 6 months since I last ran a benchmark at work, so I had a quick look around, but ended up with Apache Bench - not only because I'm familiar with it, but because it does exactly what I need. 

| Tool            | Description                          | Pros                       | Cons                       |
|-----------------|--------------------------------------|----------------------------|----------------------------|
| Apache Bench    | HTTP benchmarking tool from Apache   | Easy to use                | Single-threaded            |
| wrk             | Modern HTTP benchmarking tool        | Multi-threaded             | No time-based metrics      |
| Artillery       | Node.js load testing toolkit         | HTTP/WebSocket support     | Node.js overhead           |
| k6              | Developer-centric load testing tool  | JavaScript scripting       | CLI-only in free version   |

## Benchmark with Apache Bench

Let's start with Apache Bench.

### Setup

```bash
guix shell httpd
mkdir /tmp/ab-test && cd /tmp/ab-test
echo "email=your-email@gmail.com&name=Mike&message=Hi, I want to enquire about ...." > form-data.txt
```

The tests will run against 
- a local Dockerized server on my machine, so there's little overhead (internet, HAProxy, SSL, ...). 
- The system (AMD Ryzen 5 7640U, 64GB memory) is about ~90% idle
- The DB pool is set to a connection limit of 100, and PostgreSQL is the default Docker image

#### Default Form

I have created a form without spam checks, field validation, or integrations (email, webhooks, etc.) to keep it simple.
All that happens here is:
- check whether the form exists
- check that the account has a subscription, and / or enough balance to pay for the digest
- lookup the IP address from the maxmind database, and parse browser user agent

```bash
$ ab -n 1000 -c 10 -p form-data.txt -T application/x-www-form-urlencoded http://localhost:8003/v1/digest/b35f0ee6-23fe-4a0d-bf65-312315493775?redirect=none
This is ApacheBench, Version 2.3 <$Revision: 1923142 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 100 requests
Completed 200 requests
Completed 300 requests
Completed 400 requests
Completed 500 requests
Completed 600 requests
Completed 700 requests
Completed 800 requests
Completed 900 requests
Completed 1000 requests
Finished 1000 requests


Server Software:        
Server Hostname:        localhost
Server Port:            8003

Document Path:          /v1/digest/b35f0ee6-23fe-4a0d-bf65-312315493775?redirect=none
Document Length:        0 bytes

Concurrency Level:      10
Time taken for tests:   4.745 seconds
Complete requests:      1000
Failed requests:        0
Total transferred:      197000 bytes
Total body sent:        290000
HTML transferred:       0 bytes
Requests per second:    210.76 [#/sec] (mean)
Time per request:       47.448 [ms] (mean)
Time per request:       4.745 [ms] (mean, across all concurrent requests)
Transfer rate:          40.55 [Kbytes/sec] received
                        59.69 kb/s sent
                        100.23 kb/s total

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       2
Processing:     4   47  25.7     44     149
Waiting:        4   47  25.7     44     148
Total:          4   47  25.7     45     149

Percentage of the requests served within a certain time (ms)
  50%     45
  66%     56
  75%     62
  80%     66
  90%     81
  95%     94
  98%    111
  99%    122
 100%    149 (longest request)
```

A mean request time of 47ms with 10 concurrent requests is not too bad.

Let's increase the concurrency to 100 and see how it performs under higher load:


```bash
$ ab -n 1000 -c 100 -p form-data.txt -T application/x-www-form-urlencoded http://localhost:8003/v1/digest/b35f0ee6-23fe-4a0d-bf65-312315493775?redirect=none

Document Path:          /v1/digest/b35f0ee6-23fe-4a0d-bf65-312315493775?redirect=none
Document Length:        0 bytes

Concurrency Level:      100
Time taken for tests:   4.381 seconds
Complete requests:      1000
Failed requests:        0
Total transferred:      197000 bytes
Total body sent:        290000
HTML transferred:       0 bytes
Requests per second:    228.24 [#/sec] (mean)
Time per request:       438.141 [ms] (mean)
Time per request:       4.381 [ms] (mean, across all concurrent requests)
Transfer rate:          43.91 [Kbytes/sec] received
                        64.64 kb/s sent
                        108.55 kb/s total

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   1.0      0       5
Processing:    10  402 118.9    430     626
Waiting:        5  402 118.9    430     626
Total:         10  403 118.1    430     626

Percentage of the requests served within a certain time (ms)
  50%    430
  66%    447
  75%    460
  80%    470
  90%    493
  95%    513
  98%    543
  99%    574
 100%    626 (longest request)
```

Our mean request time is up by 10x, now at 438ms with 100 concurrent requests. 
This is expected, as the server has to handle more simultaneous connections, which increases the processing time.

There's a lot of room for optimization. In a production environment, a load balancer would distribute the load across multiple instances, which would help keep the request times on the lower end of ~5-50ms.

Let's test more sustained load with 10,000 requests and 100 concurrent connections:

```bash
$ ab -n 10000 -c 100 -p form-data.txt -T application/x-www-form-urlencoded http://localhost:8003/v1/digest/b35f0ee6-23fe-4a0d-bf65-312315493775?redirect=none

Document Path:          /v1/digest/b35f0ee6-23fe-4a0d-bf65-312315493775?redirect=none
Document Length:        0 bytes

Concurrency Level:      100
Time taken for tests:   48.740 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      1970000 bytes
Total body sent:        2900000
HTML transferred:       0 bytes
Requests per second:    205.17 [#/sec] (mean)
Time per request:       487.402 [ms] (mean)
Time per request:       4.874 [ms] (mean, across all concurrent requests)
Transfer rate:          39.47 [Kbytes/sec] received
                        58.10 kb/s sent
                        97.58 kb/s total

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.4      0       4
Processing:    10  484  59.4    480     743
Waiting:        6  484  59.4    480     743
Total:         10  484  59.2    480     743

Percentage of the requests served within a certain time (ms)
  50%    480
  66%    499
  75%    512
  80%    522
  90%    546
  95%    570
  98%    598
  99%    619
 100%    743 (longest request)
```

The mean request time has now increased to 487ms with 10,000 requests at 100 concurrent connections with 100% CPU utilization. Not too bad for this little Ryzen 5, and no optimization whatsoever. 

~ 17,726,688 requests per day.

#### SPAM Checks

I've setup a new form; Everything remains the same, except that we're now checking the message for spam, and lookup whether the user has reported the email as spam. This is quite heavy, because the bayesian spam filter. The filter is CPU-bound so for the first test I will use a concurrency of 1:

```bash
$ ab -n 100 -c 1 -p form-data.txt -T application/x-www-form-urlencoded http://localhost:8003/v1/digest/5fce6d21-a9a5-4e9e-a598-896818765a80?redirect=none

Document Path:          /v1/digest/5fce6d21-a9a5-4e9e-a598-896818765a80?redirect=none
Document Length:        0 bytes

Concurrency Level:      1
Time taken for tests:   49.728 seconds
Complete requests:      100
Failed requests:        0
Total transferred:      19700 bytes
Total body sent:        29000
HTML transferred:       0 bytes
Requests per second:    2.01 [#/sec] (mean)
Time per request:       497.281 [ms] (mean)
Time per request:       497.281 [ms] (mean, across all concurrent requests)
Transfer rate:          0.39 [Kbytes/sec] received
                        0.57 kb/s sent
                        0.96 kb/s total

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.0      0       0
Processing:     5  497 901.5      8    2585
Waiting:        5  497 901.5      8    2585
Total:          5  497 901.5      8    2586

Percentage of the requests served within a certain time (ms)
  50%      8
  66%     16
  75%    177
  80%   2053
  90%   2181
  95%   2222
  98%   2357
  99%   2586
 100%   2586 (longest request)
```

You can already see, that the request time increases quickly, because even though the spam check runs in a separate thread, the overall load is at 100%.

Let's see what happens, when we increase the concurrency to 10:

```bash
$ ab -n 1000 -c 10 -p form-data.txt -T application/x-www-form-urlencoded http://localhost:8003/v1/digest/5fce6d21-a9a5-4e9e-a598-896818765a80?redirect=none

Document Path:          /v1/digest/5fce6d21-a9a5-4e9e-a598-896818765a80?redirect=none
Document Length:        0 bytes

Concurrency Level:      10
Time taken for tests:   325.132 seconds
Complete requests:      1000
Failed requests:        0
Total transferred:      197000 bytes
Total body sent:        290000
HTML transferred:       0 bytes
Requests per second:    3.08 [#/sec] (mean)
Time per request:       3251.321 [ms] (mean)
Time per request:       325.132 [ms] (mean, across all concurrent requests)
Transfer rate:          0.59 [Kbytes/sec] received
                        0.87 kb/s sent
                        1.46 kb/s total

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       5
Processing:     6 3198 2794.1   2615   15867
Waiting:        5 3198 2794.1   2615   15866
Total:          6 3198 2794.1   2616   15867

Percentage of the requests served within a certain time (ms)
  50%   2616
  66%   4004
  75%   4887
  80%   5227
  90%   7271
  95%   8430
  98%  10139
  99%  11445
 100%  15867 (longest request)
```

The mean request time has skyrocketed to 3251ms with 10 concurrent requests, which is expected because the SPAM check is using a significant amount of CPU cycles, and runs concurrently with the request processing.

It would be really easy to improve this by queuing the SPAM checks to be processed later, or offloading them to another server, but most of Formshive users use captchas because they are much more reliable at keeping spam out and free. 

A spam check costs 0.005 Euro at the moment.
This test would have cost 5 Euro.

#### Field Validation

Next, let's test the field validation; There should be little overhead because we only check whether the given fields comply with the form rules:

```toml
[email]
name = "email"
label = "E-Mail"
field = "email"
placeholder = ""
helptext = ""
on_fail = "reject"
is_email = true

[name]
name = "name"
label = "Einzeiliger Text"
field = "text"
placeholder = ""
helptext = ""
on_fail = "pass"

[message]
name = "message"
label = "Absatztext"
field = "textarea"
placeholder = ""
helptext = ""
on_fail = "pass"

[settings]
discard_additional_fields = false
```

Let's see how it performs with 1000 requests and 10 concurrent connections:

```bash
$ ab -n 1000 -c 10 -p form-data.txt -T application/x-www-form-urlencoded http://localhost:8003/v1/digest/9454995b-27a0-43fb-a7c1-3adf0549d61c?redirect=none

Document Path:          /v1/digest/9454995b-27a0-43fb-a7c1-3adf0549d61c?redirect=none
Document Length:        0 bytes

Concurrency Level:      10
Time taken for tests:   4.713 seconds
Complete requests:      1000
Failed requests:        0
Total transferred:      197000 bytes
Total body sent:        290000
HTML transferred:       0 bytes
Requests per second:    212.16 [#/sec] (mean)
Time per request:       47.135 [ms] (mean)
Time per request:       4.713 [ms] (mean, across all concurrent requests)
Transfer rate:          40.82 [Kbytes/sec] received
                        60.08 kb/s sent
                        100.90 kb/s total

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       5
Processing:     6   47  22.7     43     166
Waiting:        6   46  22.7     43     165
Total:          6   47  22.7     44     166

Percentage of the requests served within a certain time (ms)
  50%     44
  66%     54
  75%     60
  80%     64
  90%     76
  95%     87
  98%    104
  99%    117
 100%    166 (longest request)
```

Nothing surprising here; This behaves much like the default form.

## Scaling

At this point, I have a pretty good idea about Formshive bottlenecks. There's a number of things I didn't test, but likely don't play a role here. For example:

- Captcha requests only hit the server, if the captcha is set to 'automatic', or the user specifically clicks on it
- Integrations (email, webhooks, etc.) are added to a Redis queue, so they don't block processing
- General usage: Stats, listing forms, etc. are not critical. Most users receive form notifications by email, so hardly ever login. If they do, we're talking X requests per minute times logged-in users.

Here are all individual parts, that incur overhead on form submission:

1. Spam check
2. Maxmind lookup
3. User agent parsing
4. Field validation
5. Captcha requests
6. Integrations (email, webhooks, etc.)
7. Subscription / balance checks
8. Database

### Low hanging fruit

Based on the above tests, the low-hanging fruit is the spam check; I could easily sustain 200 requests per second by queuing the spam checks in Redis, and having a separate server process them.

- 1x proxy server for SSL termination and rate limiting
- 1x application server
- 1x database server
- 1x proxy server, to delegate spam checks
- X spam check servers

<div class="mermaid">
graph TD
    Client[Client Requests]
    
    subgraph "Load Balancing"
        ProxySSL[SSL Proxy & Rate Limiting]
    end
    
    subgraph "Application Layer"
        AppServer[Application Server]
    end
    
    subgraph "Data Layer"
        DB[Database Server]
    end
    
    subgraph "Spam Processing"
        SpamProxy[Spam Proxy]
        Spam1[Spam Server 1]
        Spam2[Spam Server 2]
        SpamN[Spam Server N]
    end

    Client --> ProxySSL
    ProxySSL --> AppServer
    AppServer --> DB
    AppServer --> SpamProxy
    SpamProxy --> Spam1
    SpamProxy --> Spam2
    SpamProxy --> SpamN
</div>

### More resilience, and double throughput

The next step would be easy too; I could run the database on a separate server, and run two application servers behind a load balancer; I already use HAProxy for SSL termination so this would be a minor change:

- 1x proxy server for SSL termination and rate limiting
- 2x application server
- 1x database server
- 1x proxy server, to delegate spam checks
- X spam check servers

<div class="mermaid">
graph TD
    Client[Client Requests]
    
    subgraph "Load Balancing"
        ProxySSL[SSL Proxy & Rate Limiting]
    end
    
    subgraph "Application Layer"
        AppServer1[Application Server 1]
        AppServer2[Application Server 2]
    end
    
    subgraph "Data Layer"
        DB[Database Server]
    end
    
    subgraph "Spam Processing"
        SpamProxy[Spam Proxy]
        Spam1[Spam Server 1]
        Spam2[Spam Server 2]
        SpamN[Spam Server N]
    end

    Client --> ProxySSL
    ProxySSL --> AppServer1
    ProxySSL --> AppServer2

    AppServer1 --> DB
    AppServer2 --> DB

    AppServer1 --> SpamProxy
    AppServer2 --> SpamProxy

    SpamProxy --> Spam1
    SpamProxy --> Spam2
    SpamProxy --> SpamN
</div>

With this setup, I would be able to sustain 400 requests per second (~ 34,560,000 requests per day) and tolerate a single server failure without downtime, but a temporary performance hit.

Based on my experience and testing ([postgresql-diesel-benchmark](https://github.com/franzos/postgresql-diesel-benchmark)) PostgreSQL can easily handle millions of requests, but read performance will degrade and I would have to look into indexing, or partitioning for example.

### Enable Failover

Even though the previous setup easily allows us to scale to 600, or even 800 requests per second (~ 51,840,000 to 69,120,000 requests per day), it lacks redundancy; If HAProxy or PostgreSQL fails, the whole system is down. The next step would be to add a proxy server to handle the failover, and a second database server for redundancy.

- Hetzner Failover Subnet
- 2x proxy server for SSL termination and rate limiting
- 2x application server
- 2x PgBouncer instances, to handle database connections
- 1x proxy server, to handle database failover
- 3x etcd server, to handle database failover
- 2x database server
- 1x proxy server, to delegate spam checks
- X spam check servers

<div class="mermaid">
graph TD
    Client[Client Requests]
    
    subgraph "External"
        HetznerIP[Hetzner Failover IP]
    end
    
    subgraph "Load Balancing"
        HAProxy1[HAProxy 1 - SSL Proxy]
        HAProxy2[HAProxy 2 - SSL Proxy]
    end

    subgraph "Application Layer"
        App1[Application Server 1]
        App2[Application Server 2]
    end

    subgraph "Connection Pooling"
        PgBouncer1[PgBouncer 1]
        PgBouncer2[PgBouncer 2]
    end

    subgraph "Database Load Balancing"
        DBHAProxy[DB HAProxy]
    end

    subgraph "Data Layer"
        PG1[PostgreSQL 1 - Patroni]
        PG2[PostgreSQL 2 - Patroni]
    end

    subgraph "Coordination"
        ETCD1[etcd Node 1]
        ETCD2[etcd Node 2]
        ETCD3[etcd Node 3]
    end

    subgraph "Spam Processing"
        SpamProxy[Spam Proxy]
        Spam1[Spam Server 1]
        Spam2[Spam Server 2]
        SpamX[Spam Server N]
    end

    %% External flow
    Client --> HetznerIP
    HetznerIP --> HAProxy1
    HetznerIP --> HAProxy2

    %% Load balancer to apps
    HAProxy1 --> App1
    HAProxy1 --> App2
    HAProxy2 --> App1
    HAProxy2 --> App2

    %% Apps to connection pools
    App1 --> PgBouncer1
    App2 --> PgBouncer2

    %% Connection pools to DB load balancer
    PgBouncer1 --> DBHAProxy
    PgBouncer2 --> DBHAProxy

    %% DB load balancer to databases
    DBHAProxy --> PG1
    DBHAProxy --> PG2

    %% Database coordination
    PG1 --> ETCD1
    PG1 --> ETCD2
    PG1 --> ETCD3
    PG2 --> ETCD1
    PG2 --> ETCD2
    PG2 --> ETCD3

    %% Spam processing
    App1 --> SpamProxy
    App2 --> SpamProxy
    SpamProxy --> Spam1
    SpamProxy --> Spam2
    SpamProxy --> SpamX
</div>

#### Proxy Server Failover

The failover between the proxy server(s) is by far the trickiest part; I'm currently on Hetzner, so it would look something like this: [Failover](https://docs.hetzner.com/robot/dedicated-server/ip/failover/) and takes 90 to 120 seconds.

#### Database Failover

For the database, Patroni is a nice choice; A minimal setup would include two PostgreSQL servers, one as the primary, and one as the standby. Patroni will automatically promote the standby to primary in case of a failure. I've put together a minimal test here: [PostgreSQL High Availability with Patroni, etcd, and HAProxy](https://github.com/franzos/postgresql-patroni-failover). My goal is always to keep everything as transparent as possible, that means, minimal or no changes on the application side.

Granted, this setup includes two single-failure points but there shouldn't be any need to touch, or change them:
- PgBouncer
- HaProxy

Also, this doesn't easily scale to more PostgreSQL servers; In theory it's possible to balance the load between primary and standby database but this would require one of two things:
- either, a load balancer that can differentiate between read and write requests, or
- modifications to the application code, to support read and write requests

These days I'm on Diesel ORM and deadpool, and this is not supported out of the box but would be possible to implement.

### Optimize for Latency

In order to optimize for latency, we would want the server as close as possible to the user; That means, whatever we've done to enable failover, should be done in every region we want to serve. The complexity here is, that we may want to write to the database in both regions, but maintain a single source of truth.

Options:
- Write everything to one region, and read from the closest region
- Delegate writes based on user, or user organization, to a specific region
- Write to all regions, and do conflict resolution like BDR or Pglogical 

It might also be worth looking into YugabyteDB or CockroachDB for new projects.

#### Considerations

##### Legal

One consideration is your business case; US customers may prefer to keep their data in the US, while EU customers would probably prefer the EU; This might not necessarily mean less complexity, because you may still want to do regional failover (e.g. Paris, Frankfurt, ...).

For Formshive, I would want to allow customers to choose which region (US, EU, SEA) they prefer to have their data stored.

Latency within a region is not a problem for Formshive, so I don't have to worry as much about enabling writes to different datacenter, and can easily focus on failover between datacenter vs. scaling across datacenter:

<div class="mermaid">
graph TD
    Customers[Customer Requests]

    subgraph "Regional Routing"
        EU_Customers[EU Customers]
        US_Customers[US Customers]
    end

    subgraph "Europe Region"
        EU_Primary[Frankfurt - Primary]
        EU_Replica[Amsterdam - Replica]
    end

    subgraph "US Region"
        US_Primary[New York - Primary]
        US_Replica[Chicago - Replica]
    end

    %% Customer routing
    Customers --> EU_Customers
    Customers --> US_Customers

    %% Regional connections
    EU_Customers --> EU_Primary
    US_Customers --> US_Primary

    %% Replication
    EU_Replica --> EU_Primary
    US_Replica --> US_Primary
</div>

There's many ways to determine where a customer is located, but it's usually best to ask, or at least make it obvious that there's a choice and what we've defaulted to because users may not be in the region they appear to be, or prefer to use a different one.

For Formshive, one idea would be:
- Keep regional data (EU/US/SEA) isolated
- Maintain a global store with a hashed email / region mapping

When the user is trying to login, the region would first check its local store, and if the user was not found, query the global store with the hashed email as part of a signed request (regional keypair). The global store would return a signed response (global keypair), with the region the user is located in.

The connection between regional and global store would run over a wireguard VPN.

##### Technical

**Shape of Data**

The shape of your data can have an impact on how you handle failover; For append-only data like logs, billing records or form submissions, conflicts should rarely happen; For Formshive form submissions specifically, only two changes are possible:

- A user marks a submission as spam
- A user deletes a submission

One can imagine, that a large organization has multiple users accessing one form - one user may mark the submission as spam, and another user may delete the submission; In this case, we would have to resolve the conflict, and decide which change to keep.

**Goals**

What and how-to scale also very much depends on your goals; If for example, you wanted to run a unmetered proxy or VPN service, the tricky part is authentication and billing"; Once a user completes authentication, we can issue a JWT that contains all related information such as account validity, and the proxy server can validate the authenticity of the JWT using the public key of the authentication server. That means, it's both easy and quick to add new servers, and scale horizontally.

Many providers limit the number of concurrent connections but this can be handled quite easily by using a distributed database, where every new connection is written to a global master, which replicates to other regions, which local VPN server query to enforce the connection limit. This keeps latency for connection requests low, and only requires a write-operation, once a new device connects.

<div class="mermaid">
graph TD
    User[User]

    subgraph "VPN Layer"
        VPN[VPN Server]
    end

    subgraph "Authentication"
        AuthService[Auth Service EU]
    end

    subgraph "Connection Tracking"
        RedisMaster[Redis Master EU]
        RedisUS[Redis Replica US]
        RedisSEA[Redis Replica SEA]
    end

    %% Authentication flow
    User --> VPN
    VPN --> AuthService
    AuthService --> User

    %% Connection tracking
    VPN --> RedisMaster
    VPN --> RedisUS
    VPN --> RedisSEA

    %% Replication
    RedisMaster --> RedisUS
    RedisMaster --> RedisSEA
</div>

Once the user has established a connection, there's theoretically no need to query the connection limit again unless the user should have the ability to disconnect a device from their account.

### Optimize for Traffic

In the next part of this journey, I want to look at how to optimize for both latency and massive amounts of traffic; This is where it get's interesting, because I would want to read from, and write to the closest database without having to worry which region the user is in. That's where conflict handling (or avoidance) comes into play.

_Coming soon_