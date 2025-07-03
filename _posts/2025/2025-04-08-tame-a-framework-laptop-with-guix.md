---
title: "Tame a Framework Laptop with Guix"
summary: "How to make a Framework laptop run quieter on Guix."
layout: blog
source:
date: 2025-4-8 0:00:00 +0000
category:
  - Tools
tags:
  - guix
  - framework
  - linux
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

Much has been written about Framework, and Guix on Framework, so I want to focus specifically on making the laptop run quieter.

I've found there's two, easy "fixes":

- Disable Turbo Boost
- Improve fan control

This has been tested on the Ryzen 5 7640U, but should work on other models.

### Disable Turbo Boost

One of the biggest sources of excessive heat, and thus noise, is the Turbo Boost feature of the CPU. This feature allows the CPU to run at higher clock speeds for short periods of time, but it can also lead to increased power consumption and heat generation.

#### Manual

Check if turbo boost is enabled (1 = enabled):

```bash
$ cat /sys/devices/system/cpu/cpufreq/boost
1
```

Disable it:

```bash
$ echo 0 | sudo tee /sys/devices/system/cpu/cpufreq/boost
0
```

Enable it:

```bash
$ echo 1 | sudo tee /sys/devices/system/cpu/cpufreq/boost
1
```

#### Guix-Style

You can achieve the same via system config:

```scheme
(service tlp-service-type
         (tlp-configuration
           (cpu-scaling-governor-on-ac (list "balanced" "performance"))
           (cpu-boost-on-ac? #f)  ;; disable on AC
           (cpu-scaling-governor-on-bat (list "low-power"))
           (cpu-boost-on-bat? #f) ;; disable on battery
           (sched-powersave-on-bat? #t)))
```

### Improve Fan Control

The default fan control on the Framework laptop is sub-optimal. It tends to ramp up the fans too quickly, or runs them at higher speeds than necessary.

The following steps assume that you have access to `ectool` and `fw-fanctrl`, both of which can be found on the on the [panther](https://channels.pantherx.org/panther.git/plain/README.md) channel.

Spawn a shell with the required dependencies:

```bash
guix shell fw-fanctrl
sudo mkdir /etc/fw-fanctrl
sudo cp $(dirname $(dirname $(readlink -f $(which fw-fanctrl))))/lib/python3.10/site-packages/fw_fanctrl/_resources/config.json /etc/fw-fanctrl/config.json
```

Run the fan control daemon:

```bash
sudo fw-fanctrl run lazy
```

To reset to default:

```bash
sudo ectool autofanctrl
```

PS: I'm working to add a shepherd service, to automate it.

Preview:

```bash
Strategy: 'lazy'
Default: False
Speed: 19%
Temp: 56.0°C
MovingAverageTemp: 56.17°C
EffectiveTemp: 56.0°C
Active: True
DefaultStrategy: 'lazy'
DischargingStrategy: ''

Strategy: 'lazy'
Default: False
Speed: 19%
Temp: 56.0°C
MovingAverageTemp: 56.17°C
EffectiveTemp: 56.0°C
Active: True
DefaultStrategy: 'lazy'
DischargingStrategy: ''
```

### Credits

- [github.com/TamtamHero/fw-fanctrl](https://github.com/TamtamHero/fw-fanctrl)