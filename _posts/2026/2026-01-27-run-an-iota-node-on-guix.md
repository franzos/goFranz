---
title: "Run an IOTA Node on Guix"
description: "How to run an IOTA full node on Guix System."
layout: blog
source:
date: 2026-01-27 0:00:00 +0000
category:
  - Tools
tags:
  - blockchain
  - iota
  - guix
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

Here's how to get a full node running.

## Networks

IOTA runs three networks:

| Network | RPC Endpoint | Use |
|---------|-------------|-----|
| Mainnet | `https://api.mainnet.iota.cafe:443` | Production |
| Testnet | `https://api.testnet.iota.cafe:443` | Pre-production |
| Devnet | `https://api.devnet.iota.cafe:443` | Development |

## Setup

Create the config directory and get the starter config:

```bash
mkdir -p /etc/iota && cd /etc/iota
curl -L https://fullnode-docker-setup.iota.org/mainnet | tar -zx
mv data/config/fullnode.yaml .
```

Download the genesis and migration files:

```bash
# mainnet, testnet
curl -fLJ https://dbfiles.mainnet.iota.cafe/genesis.blob -o genesis.blob
# mainnet
curl -fLJ https://dbfiles.mainnet.iota.cafe/migration.blob -o migration.blob
```

For testnet, replace `mainnet` with `testnet` in the URLs above. Testnet doesn't need the `migration.blob`.

## Configuration

The default config uses `/opt/iota` which is a Docker convention. On Guix, we use `/var/lib` for service data. Edit `/etc/iota/fullnode.yaml`:

```yaml
# Database
db-path: "/var/lib/iota/db"

# Genesis files
genesis:
  genesis-file-location: "/etc/iota/genesis.blob"
migration-tx-data-path: "/etc/iota/migration.blob"  # mainnet only

# Your public hostname - peers need this to find you
p2p-config:
  external-address: /dns/your-hostname.example.com/udp/8084
```

Leave the rest (seed peers, archive fallback) as-is.

## Ports

Make sure these are open:

| Port | Protocol | Purpose |
|------|----------|---------|
| 8084 | UDP | P2P sync |
| 9000 | TCP | JSON-RPC |

## Test Run

Before setting up the service, you can run the node manually to make sure everything works:

```bash
guix shell iota -- iota-node --config-path /etc/iota/fullnode.yaml
```

Or with debug logging:

```bash
guix shell iota -- sh -c 'RUST_LOG="info,iota_core=debug,consensus=debug" iota-node --config-path /etc/iota/fullnode.yaml'
```

Once you see checkpoints coming in, you're good to set up the service.

## System Service

Add the service:

```scheme
(use-modules (px services iota))

(services
 (cons* (service iota-node-service-type
                 (iota-node-configuration
                  (config-file "/etc/iota/fullnode.yaml")))
        %base-services))
```

The service creates an `iota` user, sets up directories, and handles log rotation.

## Start

```bash
sudo guix system reconfigure /etc/system.scm
```

The node starts automatically. Check on it:

```bash
sudo herd status iota-node
sudo tail -f /var/log/iota-node.log
```

## Verify

Query the node to see if it's syncing:

```bash
curl -X POST http://localhost:9000 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"iota_getLatestCheckpointSequenceNumber","id":1}'
```

The checkpoint number should increase over time. Initial sync from genesis is slow - IOTA provides snapshots at [dbfiles.iota.org](https://dbfiles.iota.org) if you want to speed things up.

## CLI

The package also includes the `iota` CLI:

```bash
guix shell iota -- iota client
```

---

For validator nodes (staking, key generation), see the [IOTA operator docs](https://docs.iota.org/operator).  
The IOTA package is available from my Guix channel: [panther](https://codeberg.org/gofranz/panther).
