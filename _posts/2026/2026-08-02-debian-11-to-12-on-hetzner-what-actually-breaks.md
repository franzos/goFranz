---
title: "Debian 11 to 12 on Hetzner: What Actually Breaks"
description: "A bootloader package that had quietly stopped running, an unpinned NIC name, and an sshd config that isn't a conffile."
layout: blog
source:
date: 2026-8-2 0:00:00 +0000
category:
  - Linux
tags:
  - debian
  - hetzner
  - grub
  - systemd
  - sysadmin
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I had a box sitting at 569 days of uptime and a deadline: Debian 11 goes end of life on 31 August, so it had to move. It's a Hetzner dedicated server - BIOS boot, MBR partitions, two NVMes in software RAID1, no IPMI. If it doesn't come back, my recovery path is the rescue system and a support ticket for a console. Not the kind of thing you want to find out about at 2am.

The upgrade itself was boring. Everything interesting happened before it.

### The bootloader is what kills you

The box boots BIOS, but `grub-efi-amd64` was installed and `grub-pc` wasn't. Those two conflict by design, so at some point one replaced the other and nobody noticed. The consequence is subtle: `/boot/grub/i386-pc/` and the `core.img` in the MBR gap are only ever written by `grub-install`, and `grub-install` only runs automatically from `grub-pc`'s postinst. No `grub-pc`, no `grub-install`. Mine hadn't run since March 2023.

Within one release that's harmless; the boot code and the modules are stale together, so they agree with each other. Across a release upgrade it isn't, and this is the documented way Hetzner boxes with `md1` as `/boot` die on this exact upgrade - GRUB comes up and can't find `normal.mod`.

Here's what to check before anything else:

```bash
[ -d /sys/firmware/efi ] && echo EFI || echo BIOS
dpkg -l | grep ^ii | grep grub
ls -la /boot/grub/i386-pc/core.img
```

If that timestamp is years old on a BIOS box, there's your problem. The fix is one command, and the debconf answer for which disks to install to is usually still sitting there from the original install:

```bash
apt install grub-pc   # this removes grub-efi-amd64
```

It prints `Installing for i386-pc platform` once per disk. Then reboot and prove it, while you're still on the old release and a failure has exactly one cause.

After that the upgrade handled itself: `grub-pc`'s postinst re-ran `grub-install` on both NVMes, and I could verify both boot gaps had changed and matched each other.

### Your NIC name probably isn't pinned

`/etc/network/interfaces` hardcoded the interface name. Nothing pinned it - it's derived at boot from the PCI path by systemd's naming scheme, which is versioned and changes between releases. 11 to 12 takes systemd from 247 to 252.

A rename doesn't break the boot. It gives you a box that's up, healthy and unreachable, which on a machine with no IPMI is the worse outcome of the two.

```
# /etc/systemd/network/10-eth.link
[Match]
MACAddress=aa:bb:cc:dd:ee:ff

[Link]
Name=enp0s31f6
```

udev applies `.link` files whether or not networkd is running, so this sits happily alongside ifupdown. Confirm it made it into the new initramfs before you reboot:

```bash
lsinitramfs /boot/initrd.img-6.1.0-* | grep -i '\.link'
```

### sshd_config is ucf-managed, not a conffile

This one I'd never noticed. `/etc/ssh/sshd_config` isn't listed in `openssh-server.conffiles`; it's handled by ucf instead. My Ansible role had been editing it in place with `lineinfile`, which leaves ucf's recorded hash stale - so the upgrade was going to prompt about a locally modified file, and taking the maintainer's copy would have quietly re-enabled `PasswordAuthentication`.

The fix is to stop editing that file at all. `Include /etc/ssh/sshd_config.d/*.conf` sits above every directive and sshd is first-match-wins, so a drop-in beats it:

```
# /etc/ssh/sshd_config.d/99-local.conf
PasswordAuthentication no
```

Then restore the main file from `/var/lib/ucf/cache/` so the hash matches again. No prompt, and the upgrade replaced `sshd_config` silently while the policy survived untouched.

### Reboot first, on its own

569 days of uptime means the boot path is unproven. Not GRUB specifically - the kernel you installed twelve ABI bumps ago and never booted, the firewall rules you changed live, the config you poked in by hand. Reboot before the upgrade, so that if something is broken it has one cause instead of two.

Same reason to clear `/boot` first. Mine had twelve kernels and 310M free; a dist-upgrade running out of space there mid-transaction is a bad place to be. `apt autoremove` took it to 818M.

### Things I worried about that turned out fine

- **GRUB 2.12.** Bookworm ships 2.06, same as bullseye. The 2.06 to 2.12 jump is 12 to 13.
- **cgroup v1 to v2.** Already v2 - systemd 247 on bullseye reports `default-hierarchy=unified`.
- **iptables-nft.** Default since buster, not bookworm.
- **Deprecated sshd options.** The ones that make sshd refuse to start died in OpenSSH 7.6, back in 2017.

### Result

`280 upgraded` on the minimal pass, `369 upgraded, 39 new, 3 removed` on the full one, both clean. Kernel 5.10 to 6.1, systemd 247 to 252. The reboot took about 73 seconds and every container came back.

Docker came through the package upgrade still running, incidentally - `live-restore: true` in `daemon.json` lets dockerd be replaced without stopping containers. I still stopped the stack before the reboot itself, because with `live-restore` a plain `reboot` skips Docker's stop path entirely and your databases get reaped by systemd rather than shut down.

The interesting failures here were all things that had been broken for years without showing it. None of the real work was the upgrade - it was the hour beforehand, finding the three things that were already wrong.
