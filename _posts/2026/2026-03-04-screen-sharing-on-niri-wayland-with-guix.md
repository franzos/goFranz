---
title: "Screen Sharing on Niri/Wayland with Guix"
description: "How to enable screen sharing on Niri/Wayland using Guix"
layout: blog
source:
date: 2026-03-04 0:00:00 +0000
category:
  - Tools
tags:
  - guix
  - wayland
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

This is a follow-up to my earlier post on [Screen Sharing on Sway/Wayland with Guix](/tools/2025/09/15/screen-sharing-on-sway-wayland-guix.html). I've since switched from Sway to [Niri](https://github.com/YaLTeR/niri) — a scrollable-tiling Wayland compositor — and the screen sharing setup is a bit different.

The main change: Niri implements the `org.gnome.Mutter.ScreenCast` D-Bus interface, so you use `xdg-desktop-portal-gnome` instead of the `wlr` portal.

### 1. Portal Configuration

Create or update your `portals.conf`:

```toml
[preferred]
default=gtk
# use gnome portal for screen sharing (niri compatible)
org.freedesktop.impl.portal.ScreenCast=gnome
org.freedesktop.impl.portal.Screenshot=gnome
```

### 2. Niri Startup Commands

In your `niri.kdl` config, add these startup commands:

```
// Export Wayland display and desktop session to D-Bus
spawn-at-startup "dbus-update-activation-environment" "--systemd" "WAYLAND_DISPLAY" "XDG_CURRENT_DESKTOP=niri"

// Restart portal-gnome after niri's ScreenCast D-Bus interface is ready
spawn-at-startup "sh" "-c" "while ! busctl --user status org.gnome.Mutter.ScreenCast >/dev/null 2>&1; do sleep 0.2; done; pkill -f xdg-desktop-portal-gnome"
```

The second command is the critical bit: `xdg-desktop-portal-gnome` often starts before Niri's ScreenCast interface is available. This polls until the interface is ready, then restarts the portal so it picks up the screencasting capability.

### 3. Required Packages

```
xdg-desktop-portal-gnome
xdg-desktop-portal-gtk
wayland-protocols
slurp
```

### 4. Chrome / WebRTC Black Screen Fix

If you're getting a black screen when sharing in Chrome or other Chromium-based browsers, it's because they don't handle DMA-BUF formats properly. There's a [Niri PR #1791](https://github.com/YaLTeR/niri/pull/1791) that adds a SHM (Shared Memory) fallback for PipeWire screencasting.

I've packaged this as `niri-shm` in my [panther](https://github.com/franzos/panther) Guix channel:

```scheme
;; in px/packages/wm.scm
(define-public niri-shm
  (package
    (inherit niri)
    (name "niri-shm")
    (source
     (origin
       (inherit (package-source niri))
       (patches (list (local-file "patches/niri-shm-support.patch")))))
    (synopsis "Niri with SHM screencast support")
    (description
     "Niri scrollable-tiling Wayland compositor with shared memory (SHM)
fallback for PipeWire screencasting.  This fixes screen sharing in browsers
like Chrome that cannot handle DMA-BUF formats.")))
```

Use `niri-shm` in place of `niri` in your Guix Home config.

### 5. Guix Home

Putting it all together:

```scheme
(home-environment
 (packages
  (cons* niri-shm
  (specifications->packages
   (list
         "xdg-desktop-portal-gnome"
         "xdg-desktop-portal-gtk"
         "wayland-protocols"
         "slurp"
         "pipewire"
         "wireplumber"
         ;; ...
         ))))
 (services
  (append (list
        (service home-xdg-configuration-files-service-type
                  `(("niri/config.kdl" ,(local-file "niri.kdl"))
                    ("xdg-desktop-portal/portals.conf" ,(local-file "portals.conf"))))
        (simple-service 'env-vars home-environment-variables-service-type
                        `(("XDG_CURRENT_DESKTOP" . "niri")
                          ("XDG_SESSION_DESKTOP" . "niri")
                          ("XDG_SESSION_TYPE" . "wayland")
                          ("ELECTRON_OZONE_PLATFORM_HINT" . "wayland")
                          ("MOZ_ENABLE_WAYLAND" . "1")
                          ("NIXOS_OZONE_WL" . "1")
                          ("GDK_BACKEND" . "wayland")
                          ("CLUTTER_BACKEND" . "wayland")))
        (service home-dbus-service-type)
        (service home-pipewire-service-type
                 (home-pipewire-configuration
                  (pipewire pipewire)
                  (wireplumber wireplumber))))
        %base-home-services)))
```

### Testing

Use the [Mozilla WebRTC Test Page](https://mozilla.github.io/webrtc-landing/gum_test.html) to verify screen sharing works. You should get a prompt to select a screen or window — if the preview shows your desktop, you're good.

For my full config, checkout [my dotfiles](https://github.com/franzos/dotfiles/tree/master/home).
