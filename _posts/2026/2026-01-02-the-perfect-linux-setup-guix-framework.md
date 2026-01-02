---
title: "The Perfect Linux Setup: Guix on a Framework Laptop"
summary: "How I configured my Framework laptop with Guix for fingerprint login, YubiKey sudo, automatic theme switching, and more."
layout: blog
source:
date: 2026-01-02 1:00:00 +0000
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

After years of configuration tweaking, I think I've finally landed on a setup that feels complete. Everything works together. My Framework laptop (AMD) boots to a fingerprint scan, I sudo with a touch of my YubiKey, themes switch automatically at sunset, and my entire configuration syncs effortlessly between this, and my older ThinkPad.

Here's the stack that makes it happen.

## Guix System and Home

[GNU Guix](https://guix.gnu.org/) is both the operating system and the secret sauce. Unlike traditional distros where configuration sprawls across `/etc`, shell scripts, and `.config` files, Guix declares everything in Scheme. The entire system state - services, packages, dotfiles - lives in version-controlled `.scm` files.

This makes sharing configuration between machines trivial. My ThinkPad and Framework both inherit from a common base:

```scheme
(use-modules (px system config))

(px-desktop-os
 (operating-system
  (host-name "framework")
  (timezone "Europe/Lisbon")
  ;; Machine-specific bits go here
  ))
```

The machine-specific stuff (AMD vs Intel GPU, LUKS encryption, power profiles) layers on top.

## Fingerprint Login

The Framework's fingerprint reader works with `fprintd`, but requires PAM configuration to actually use it for login. In Guix, this means adding a PAM extension:

```scheme
(simple-service 'fprintd-pam-login
  pam-root-service-type
  (list (pam-extension
         (transformer
          (lambda (pam)
            (if (member (pam-service-name pam) '("greetd" "swaylock"))
                (pam-service
                 (inherit pam)
                 (auth (cons (pam-entry
                              (control "sufficient")
                              (module (file-append fprintd "/lib/security/pam_fprintd.so")))
                             (pam-service-auth pam))))
                pam))))))
```

After enrolling prints with `fprintd-enroll`, login and screen unlock accept my fingerprint.

## Sudo with YubiKey

For elevated commands, I've configured PAM to accept a YubiKey challenge-response instead of typing a password. First, program slot 2 with a challenge-response credential:

```bash
guix shell python-yubikey-manager -- ykman otp chalresp --touch 2 <your-secret-hex>
```

Then add the PAM extension for sudo:

```scheme
(simple-service 'yubico-pam-sudo
  pam-root-service-type
  (list (pam-extension
         (transformer
          (lambda (pam)
            (if (member (pam-service-name pam) '("sudo"))
                (pam-service
                 (inherit pam)
                 (auth (cons (pam-entry
                              (control "sufficient")
                              (module (file-append yubico-pam "/lib/security/pam_yubico.so"))
                              (arguments '("mode=challenge-response")))
                             (pam-service-auth pam))))
                pam))))))
```

Now `sudo` just needs a tap - more secure and more convenient than passwords.

## Automatic Dark/Light Themes

I [wrote about this previously](/tools/2025/11/02/automatic-dark-light-theme-switching-sway-guix.html) - Darkman switches themes at sunrise and sunset. What's changed since then is coverage. The theme switch now propagates to:

- **GTK apps** (Thunar, GNOME apps) via gsettings
- **Foot terminal** with custom shell scripts
- **Dunst notifications**
- **VSCode** via jq-based settings manipulation
- **Waybar** with separate CSS files
- **Niri** window manager focus rings
- **Swaylock**

Everything shifts from light to dark at sunset without any manual intervention. The scripts live in `~/.local/share/dark-mode.d/` and `~/.local/share/light-mode.d/`.

## Chrome Hardware Acceleration

Getting Chrome to actually use the GPU on Linux takes some trial and error. I've got a custom `.desktop` launcher that forces Vulkan and VA-API:

```bash
google-chrome \
  --use-angle=vulkan \
  --enable-features=VaapiVideoDecoder,VaapiVideoEncoder,VaapiIgnoreDriverChecks,Vulkan,VulkanFromANGLE,DefaultANGLEVulkan,UseMultiPlaneFormatForHardwareVideo
```

Combined with environment variables for the AMD GPU:

```scheme
("LIBVA_DRIVER_NAME" . "radeonsi")
("ANGLE_DEFAULT_PLATFORM" . "vulkan")
```

This enables things like blurred backgrounds in Google Meets and smooth video playback.

## Bluetooth Audio That Works

Bluetooth headphones on Linux have historically been painful. WirePlumber's default configuration often picks the wrong codec or profile. I've tuned it for high-quality audio:

```lua
bluez_monitor.properties = {
  ["bluez5.enable-sbc-xq"] = true,
  ["bluez5.enable-msbc"] = true,
  ["bluez5.enable-hw-volume"] = true,
  ["bluez5.codecs"] = "[ sbc sbc_xq aac ]",
  ["bluez5.profile"] = "a2dp-sink",
}
```

## Power Management

The Framework AMD runs the Power Profiles Daemon with aggressive power saving:

```scheme
(kernel-arguments
 '("pcie_aspm.policy=powersupersave"
   "amdgpu.ppfeaturemask=0xffffffff"))
```

After 60 minutes of suspend, it hibernates to disk automatically.

On the ThinkPad, TLP handles the same job with Intel-specific tweaks.

## Secrets with Tomb

Both machines need access to the same secrets - GPG keys, KeePass database, AWS credentials. I use [Tomb](https://dyne.org/software/tomb/) to store these in an encrypted container that syncs between machines via Syncthing.

The tomb is encrypted with a GPG key stored on my YubiKey, so unlocking is just another tap:

```bash
tomb open .secrets.tomb -k .secrets.tomb.key -gR A1B2C3D4E5F6G7H8 -f
```

Once mounted, bind mounts put everything in place - `~/.gnupg`, `~/.aws`, the KeePass database. Same secrets, same workflow, on either machine.

## What's Shared, What's Not

Both machines pull from the same dotfiles repo. Common configuration includes:

- Darkman theme scripts
- Niri compositor config
- Mail stack (aerc + isync + msmtp)
- Bluetooth audio tuning
- GTK themes and fonts

Machine-specific config stays in separate files:

- GPU drivers and firmware
- Power management (TLP vs PPD)
- Display scaling (Framework's 3:2 screen needs 1.5x)
- Encryption keys and hardware IDs

Guix's module system makes this separation clean.

## The Result

My laptop boots, I scan my finger, and I'm in a consistent environment whether I'm on the Framework or ThinkPad. Updates pull automatically via unattended upgrades. Theme switches happen without thinking about it. Hardware acceleration works. Audio sounds good.

Is it perfect? Probably not - there's always something to tweak. But it's the closest I've gotten to a Linux setup that stays out of my way.

The full configuration lives at [github.com/franzos/dotfiles](https://github.com/franzos/dotfiles).
