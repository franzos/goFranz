---
title: "From Docker to Podman on Guix"
description: "A guide on transitioning from Docker to Podman using Guix."
layout: blog
source:
date: 2025-09-07 0:00:00 +0000
category:
  - Tools
tags:
  - docker
  - podman
  - containers
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I've recently taken the plunge to move from Docker to Podman. Now that guix supplies a `rootless-podman-service-type` service, and all related packages are available, the transition is pretty smooth.

## Migration

I previously used nftables, but to enable bridge networking with Podman, iptables are required.

The following rules take care of:
- Blocking all incoming connections, except established connections
- Port 22000 is for Syncthing, so you might not need this
- `-A INPUT -i lo -j ACCEPT` is required to access the container's on localhost

```scheme
(define %iptables-ipv4-rules
  (plain-file "iptables.rules" "*filter
:INPUT ACCEPT
:FORWARD ACCEPT
:OUTPUT ACCEPT
-A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
-A INPUT -i lo -j ACCEPT
-A INPUT -p tcp --dport 22000 -j ACCEPT
-A INPUT -j REJECT --reject-with icmp-port-unreachable
COMMIT
"))

(define %iptables-ipv6-rules
  (plain-file "ip6tables.rules" "*filter
:INPUT ACCEPT
:FORWARD ACCEPT
:OUTPUT ACCEPT
-A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
-A INPUT -p tcp --dport 22000 -j ACCEPT
-A INPUT -j REJECT --reject-with icmp6-port-unreachable
COMMIT
"))

(service iptables-service-type
      (iptables-configuration
       (ipv4-rules %iptables-ipv4-rules)
       (ipv6-rules %iptables-ipv6-rules)))
```

Next, I replaced `containerd` and `docker` services with `podman`; Important is, that you supply your username in the `subuids` and `subgids` section:

```scheme
;; Add this at the top of your configuration file:
#:use-module (gnu system accounts) ;; for 'subid-range'

;; (service containerd-service-type)
;; (service docker-service-type)
(service rootless-podman-service-type
         (rootless-podman-configuration
          (subgids
           (list (subid-range (name "franz"))))
          (subuids
           (list (subid-range (name "franz"))))))
```

Lastly, add `cgroup` to your user, so Podman can manage cgroups:

```scheme
(users
 (cons
  (user-account
   (name "franz")
   (comment "default")
   (group "users")
   (supplementary-groups '("wheel"
                           "netdev"
                           ;; "docker"
                           "cgroup"
                           "kvm"
                           "audio"
                           "video"
                           "plugdev"
                           "input"))
   (home-directory "/home/franz"))
  %base-user-accounts))
```

Depending on your setup, you might either supply podman related packages globally, or in your user profile; I do so globally, because it makes the relationship between services and packages clearer:
  
```scheme
(packages 
 (cons*
  ;; docker
  ;; containerd
  ;; docker-cli
  ;; docker-compose@2
  podman           ;; container runtime
  podman-compose   ;; for docker-compose compatibility
  buildah          ;; for building images
  %panther-base-packages))
```

Now simply reconfigure your system, and you're good to go.

Once rebooted, you may want to delete old docker images and containers:

```bash
rm -rf ~/.docker
sudo rm -rf /var/lib/docker
```

## Usage

There's nothing much to say here; Podman is designed as drop-in replacement, so all commands are similiar:

To bring-up a `docker-compose.yml` file, simply run:

```bash
podman-compose up -d
```

To check running containers:

```bash
podman ps
```

The only problem I've encountered so far is, that Podman has trouble shutting down containers; I often see errors like:

```bash
WARNING:podman_compose:container did not shut down after 10 seconds, killing
WARNING:podman_compose:container did not shut down after 10 seconds, killing
WARNING:podman_compose:container did not shut down after 10 seconds, killing
```

Curiously, that doesn't actually shut down the containers, so I have to manually stop them with `podman stop <container-id>` which works as expected.

## Configure VSCode

Here's how you configure VSCode to use Podman instead of Docker:

1. Open Settings
2. Look for `dev.containers.dockerPath`
3. Set the following parameter:

- Docker Path: `podman`
- Docker Compose Path: `podman-compose`
- Docker Socket Path: `/tmp/podman.sock`

If you prefer to edit the `settings.json`:

```json
{
  "dev.containers.dockerPath": "podman",
  "dev.containers.dockerComposePath": "podman-compose",
  "dev.containers.dockerSocketPath": "/tmp/podman.sock",
  "containers.environment": {
    "DOCKER_HOST": "/tmp/podman.sock"
  },
  "terminal.integrated.env.linux": {
    "DOCKER_HOST": "/tmp/podman.sock"
  },
}
```

Whenever you need the socket, run `podman system service --time=0 unix:///tmp/podman.sock` as user.

---

You can read more about Podman on Guix on the [Miscellaneous Services](https://guix.gnu.org/manual/devel/en/html_node/Miscellaneous-Services.html) page of the Guix manual.

**Update: 2025-09-10**

Added notes on how-to configure VScode to use Podman.