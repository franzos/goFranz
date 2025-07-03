---
title: "Install Bluez 5.66 on Debian Bullseye (Pi4, CM4)"
summary: Install newer Bluez version and update RPI bluetooth firmware
layout: blog
source:
date: 2023-11-07 0:00:00 +0000
category:
  - Tools
tags:
  - debian
  - bluetooth
  - raspberrypi
  - linux
  - arm
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

The Bullseye repositories version is pretty old; Here's how-to update your Raspberry Pi4 or Compute Module 4 to Bluez 5.66 (or newer):

### Steps

Dependencies:

```bash
apt install libdbus-glib-1-dev libudev-dev libical-dev libreadline-dev 
python3 -m pip install meson
```

Compile Glib:

```bash
wget https://download.gnome.org/sources/glib/2.74/glib-2.74.7.tar.xz
tar xvf glib-2.74.7.tar.xz
cd glib-2.74.7
meson setup _build  
meson compile -C _build
meson install -C _build 
```

Compile Bluez:

```bash
wget http://www.kernel.org/pub/linux/bluetooth/bluez-5.66.tar.xz
tar xvf bluez-5.66.tar.xz
cd bluez-5.66
./configure --prefix=/usr --mandir=/usr/share/man --sysconfdir=/etc --localstatedir=/var --enable-testing --enable-experimental --enable-deprecated
make && make install
```

Compile firmware:

```bash
git clone https://github.com/RPi-Distro/bluez-firmware.git
cd bluez-firmware/
./configure --libdir=/lib
make && make install
```

Install service:

```bash
cp /lib/systemd/system/bluetooth.service /etc/systemd/system/bluetooth.service
systemctl daemon-reload
systemctl enable bluetooth.service
```

Update bluetooth firmware:

```bash
cp /lib/firmware/brcm/BCM4345C0.hcd /lib/firmware/brcm/BCM4345C0.hcd.bk
wget https://github.com/RPi-Distro/bluez-firmware/raw/master/broadcom/BCM4345C0.hcd -O /lib/firmware/brcm/BCM4345C0.hcd
```

Simlink firmware for service:

```bash
sudo ln -s /lib/firmware /etc/firmware
```

Add udev rules:

```bash
nano /lib/udev/rules.d/90-pi-bluetooth.rules
```

with content (src: [github.com/RPi-Distro/pi-bluetooth](https://github.com/RPi-Distro/pi-bluetooth/blob/master/lib/udev/rules.d/90-pi-bluetooth.rules)):

```
# Raspberry Pi bluetooth module: enable routing of SCO packets to the HCI interface
ACTION=="add", SUBSYSTEM=="bluetooth", KERNEL=="hci[0-9]", TAG+="systemd", ENV{SYSTEMD_WANTS}+="bthelper@%k.service"
```

Add helper scripts:

```bash
sudo wget https://github.com/RPi-Distro/pi-bluetooth/raw/master/usr/bin/btuart -O /usr/bin/btuart
chmod +x /usr/bin/btuart
sudo wget https://github.com/RPi-Distro/pi-bluetooth/raw/master/usr/bin/bthelper -O /usr/bin/bthelper
chmod +x /usr/bin/bthelper
```

Add hciuart service:

```bash
nano /lib/systemd/system/pi-bluetooth.hciuart.service
```

with content:

```
[Unit]
Description=Configure Bluetooth Modems connected by UART
ConditionFileNotEmpty=/proc/device-tree/soc/gpio@7e200000/bt_pins/brcm,pins
After=dev-serial1.device

[Service]
Type=forking
ExecStart=/usr/bin/btuart

[Install]
WantedBy=dev-serial1.device
```

and activate:

```bash
systemctl daemon-reload
systemctl enable pi-bluetooth.hciuart.service
```

Add bthelper service:

```bash
nano /lib/systemd/system/pi-bluetooth.bthelper@.service
```

with content:

```
[Unit]
Description=Raspberry Pi bluetooth helper
Requires=hciuart.service bluetooth.service
After=hciuart.service
Before=bluetooth.service

[Service]
Type=oneshot
ExecStart=/usr/bin/bthelper %I
RemainAfterExit=yes
```

and reload; there's no need to enable this one:

```bash
systemctl daemon-reload
```

modify config to enable experimental features:

```bash
nano /etc/bluetooth/main.conf
```

look for the section and add this line:

```
[General]
Experimental=true             <---- add this
```

save and reboot.

### Result

```bash
$ hciconfig -a
hci0:   Type: Primary  Bus: UART
        BD Address: E4:5F:01:28:C3:99  ACL MTU: 1021:8  SCO MTU: 64:1
        UP RUNNING 
        RX bytes:8540 acl:9 sco:0 events:319 errors:0
        TX bytes:3904 acl:9 sco:0 commands:173 errors:0
        Features: 0xbf 0xfe 0xcf 0xfe 0xdb 0xff 0x7b 0x87
        Packet type: DM1 DM3 DM5 DH1 DH3 DH5 HV1 HV2 HV3 
        Link policy: RSWITCH SNIFF 
        Link mode: PERIPHERAL ACCEPT 
        Name: 'rpi.gateway-DEVELOPMENT-VAdyOyjFpl'
        Class: 0x000000
        Service Classes: Unspecified
        Device Class: Miscellaneous, 
        HCI Version: 5.0 (0x9)  Revision: 0x17e
        LMP Version: 5.0 (0x9)  Subversion: 0x6119
        Manufacturer: Cypress Semiconductor (305)
 
$ bluetoothctl show
Controller E4:5F:01:28:C3:99 (public)
        Name: rpi.gateway-DEVELOPMENT-VAdyOyjFpl
        Alias: rpi.gateway-DEVELOPMENT-VAdyOyjFpl
        Class: 0x00000000
        Powered: yes
        Discoverable: no
        DiscoverableTimeout: 0x000000b4
        Pairable: yes
        UUID: Generic Attribute Profile (00001801-0000-1000-8000-00805f9b34fb)
        UUID: Generic Access Profile    (00001800-0000-1000-8000-00805f9b34fb)
        UUID: PnP Information           (00001200-0000-1000-8000-00805f9b34fb)
        UUID: A/V Remote Control Target (0000110c-0000-1000-8000-00805f9b34fb)
        UUID: A/V Remote Control        (0000110e-0000-1000-8000-00805f9b34fb)
        UUID: Device Information        (0000180a-0000-1000-8000-00805f9b34fb)
        Modalias: usb:v1D6Bp0246d0542
        Discovering: yes
        Roles: central
        Roles: peripheral
Advertising Features:
        ActiveInstances: 0x00 (0)
        SupportedInstances: 0x05 (5)
        SupportedIncludes: tx-power
        SupportedIncludes: appearance
        SupportedIncludes: local-name

$ strings /lib/firmware/brcm/BCM4345C0.hcd | grep Rasp
&BCM43455 37.4MHz Raspberry Pi 3+-0190

$ strings /lib/firmware/brcm/brcmfmac43455-sdio.bin | grep Version
43455c0-roml/43455_sdio-pno-aoe-pktfilter-pktctx-lpc-pwropt-43455_ftrs-wfds-mfp-dfsradar-wowlpf-idsup-idauth-noclminc-clm_min-obss-obssdump-swdiv Version: 7.45.241 (1a2f2fa CY) CRC: 959ad1c7 Date: Mon 2021-11-01 00:40:29 PDT Ucode Ver: 1043.2164 FWID 01-703fd60

$ dmesg | grep brcmfmac
[    6.182253] brcmfmac: F1 signature read @0x18000000=0x15264345
[    6.197606] brcmfmac: brcmf_fw_alloc_request: using brcm/brcmfmac43455-sdio for chip BCM4345/6
[    6.198762] usbcore: registered new interface driver brcmfmac
[    6.461260] brcmfmac: brcmf_c_preinit_dcmds: Firmware: BCM4345/6 wl0: Nov  1 2021 00:37:25 version 7.45.241 (1a2f2fa CY) FWID 01-703fd60
[   10.655382] brcmfmac: brcmf_cfg80211_set_power_mgmt: power save enabled
[   11.201696] brcmfmac: brcmf_cfg80211_set_power_mgmt: power save enabled
[   14.660050] brcmfmac: brcmf_cfg80211_set_power_mgmt: power save enabled

pkexec dmesg | grep firmware 
[    0.088702] raspberrypi-firmware soc:firmware: Attached to firmware from 2023-03-17T10:50:39, variant start
[    0.092718] raspberrypi-firmware soc:firmware: Firmware hash is 82f3750a65fadae9a38077e3c2e217ad158c8d54
```
