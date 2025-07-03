---
title: "SEEED reTerminal display stm32 stuck in boot mode"
summary: Attempts to get stm32 unstuck
layout: blog
source:
date: 2023-11-11 0:00:00 +0000
category:
  - Tools
tags:
  - debian
  - linux
  - reterminal
  - seed
  - arm
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I've recently run into trouble with the reTerminal display on the latest Raspbian Release. Here's what got it working:

### Firmware update

SEEED offers a 1-year old image [here](https://wiki.seeedstudio.com/reTerminal-FAQ/#q2-how-can-i-flash-raspberry-pi-os-which-is-originally-shipped-with-reterminal). The direct link to the 64-bit release is this: `https://files.seeedstudio.com/wiki/ReTerminal/RPiOS_Images/2022-07-21-Raspbian-reTerminal-arm64/64bit-20220721T012743Z-001.zip`. I flashed it to make sure I have a working base.

Then proceed to update the firmware:

1. Comment `/boot/config.txt` -> `#dtoverlay=reTerminal,tp_rotate=1`
2. Reboot
3. Update Firmware ([ref](https://wiki.seeedstudio.com/reTerminal-FAQ/#q12-leds-and-buzzer-do-not-work-after-installing-reterminal-drivers))

```bash
$ i2cdetect -y 1
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                         -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- 19 -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- 29 -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- 38 -- -- -- -- -- -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- 56 -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
```

The `i2ctransfer -y 1 w2@0x45 0x9b 0x01` isn't necessary, because the device is already in boot mode. If you're seeing `0x45`, this problem doesn't apply to you, but you may proceed to flash / update the firmware anyways:

Download firmware:

```bash
cd /tmp
mkdir STM32
cd STM32/
wget https://sourceforge.net/projects/stm32flash/files/stm32flash-0.7.tar.gz
wget https://github.com/Seeed-Studio/seeed-linux-dtoverlays/releases/download/2022-05-29-reTerminal-V1.9/STM32G030F6_R2.bin
tar -xvf stm32flash-0.7.tar.gz
cd stm32flash-0.7/
make
```

Erase flash:

```bash
./stm32flash -a 0x56 -o /dev/i2c-1
stm32flash 0.7

http://stm32flash.sourceforge.net/

Warning: Not a tty: /dev/i2c-1
Error: Failed to apply settings
Error probing interface "serial_posix"
Interface i2c: addr 0x56
Version      : 0x12
Device ID    : 0x0466 (STM32G03xxx/04xxx)
- RAM        : Up to 8KiB  (4096b reserved by bootloader)
- Flash      : Up to 64KiB (size first sector: 1x2048)
- Option RAM : 128b
- System RAM : 8KiB
Erasing flash
```

Write firmware:

```bash
$ ./stm32flash -a 0x56 -w ../STM32G030F6_R2.bin -v -g 0x0 /dev/i2c-1
stm32flash 0.7

http://stm32flash.sourceforge.net/

Using Parser : Raw BINARY
Size         : 17000
Warning: Not a tty: /dev/i2c-1
Error: Failed to apply settings
Error probing interface "serial_posix"
Interface i2c: addr 0x56
Version      : 0x12
Device ID    : 0x0466 (STM32G03xxx/04xxx)
- RAM        : Up to 8KiB  (4096b reserved by bootloader)
- Flash      : Up to 64KiB (size first sector: 1x2048)
- Option RAM : 128b
- System RAM : 8KiB
Write to memory
Erasing memory
Wrote and verified address 0x08004268 (100.00%) Done.

Starting execution at address 0x08000000... done.
```

Set device to normal operation and uncomment overlay in config:

```bash
i2ctransfer -y 1 w2@0x45 0x9b 0x00
nano /boot/config.txt # uncomment overlay
reboot
```

No luck after reboot.

### Open the device

Well, what to do...

Decided to open the device and check connections; Pulled out the battery for a sec and then put it back together.

I kid you not.

```bash
 dmesg | grep "mipi_dsi\|DSI"
[    5.917948] [DSI]i2c_md_init:
[    5.918344] [DSI]i2c_md_probe:start
[    5.923940] i2c_mipi_dsi 1-0045: I2C read id: 0xc3
[    5.925653] [DSI]mipi_dsi_device:
[    5.985580] [DSI]i2c_md_probe:finished.
[    5.986348] [DSI]mipi_dsi_probe:
[    6.233156] mipi_dsi fe700000.dsi.0: failed to attach dsi to host: -517
[    6.237177] [DSI]mipi_dsi_probe:
[    6.395559] [DSI]panel_prepare:
[    8.732836] [DSI]ili9881d_prepare:
[    8.864898] [DSI]panel_enable:
[   15.040542] [DSI]panel_disable:
[   15.043957] [DSI]panel_unprepare:
[   15.101906] [DSI]panel_prepare:
[   15.160823] [DSI]ili9881d_prepare:
[   15.292868] [DSI]panel_enable:
[   15.675569] [DSI]panel_disable:
[   15.678831] [DSI]panel_unprepare:
[   15.739103] [DSI]panel_prepare:
[   15.796796] [DSI]ili9881d_prepare:
[   15.924813] [DSI]panel_enable:

$ i2cdetect -y 1
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                         -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- UU -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- UU -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- UU -- -- -- -- -- -- --
40: -- -- -- -- -- UU -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
```

It's working.

I doubt that this was it, but I can't be sure and I won't get any clear response on the support forum.

**Update: 2023-11-11**

I'm now running the latest Raspbian Desktop image with up to date kernel and working display:

```bash
Linux 6.1.0-rpi6-rpi-v8 #1 SMP PREEMPT Debian 1:6.1.58-1+rpt2 (2023-10-27) aarch64 GNU/Linux

Distributor ID: Debian
Description:    Debian GNU/Linux 12 (bookworm)
Release:        12
Codename:       bookworm
```

When you're upgrading from older releases, make sure your config is up to date; Here's an example of what seems to work as of Nov. 2023:

```bash
# For more options and information see
# http://rptl.io/configtxt
# Some settings may impact device functionality. See link above for details

# Uncomment some or all of these to enable the optional hardware interfaces
dtparam=i2c_arm=on
#dtparam=i2s=on
#dtparam=spi=on

# Enable audio (loads snd_bcm2835)
dtparam=audio=on

# Additional overlays and parameters are documented
# /boot/firmware/overlays/README

# Automatically load overlays for detected cameras
camera_auto_detect=1

# Automatically load overlays for detected DSI displays
display_auto_detect=1

# Automatically load initramfs files, if found
auto_initramfs=1

# Enable DRM VC4 V3D driver
dtoverlay=vc4-kms-v3d
max_framebuffers=2

# Don't have the firmware create an initial video= setting in cmdline.txt.
# Use the kernel's default instead.
disable_fw_kms_setup=1

# Run in 64-bit mode
arm_64bit=1

# Disable compensation for displays with overscan
disable_overscan=1

[cm4]
# Enable host mode on the 2711 built-in XHCI USB controller.
# This line should be removed if the legacy DWC2 controller is required
# (e.g. for USB device mode) or if USB support is not required.
otg_mode=1

[all]

[pi4]
# Run as fast as firmware / board allows
arm_boost=1

[all]
enable_uart=1
# optional
uart_2ndstage=1
dtoverlay=dwc2,dr_mode=host
dtparam=ant2
disable_splash=1
ignore_lcd=1
dtoverlay=vc4-kms-v3d-pi4
dtoverlay=i2c3,pins_4_5
gpio=13=pu
dtoverlay=reTerminal,key0=0x043,key1=0x044,key2=0x057,key3=0x058
# dtoverlay=reTerminal-bridge
```

If you don't use extentions, you can leave the last line `#` commented.
