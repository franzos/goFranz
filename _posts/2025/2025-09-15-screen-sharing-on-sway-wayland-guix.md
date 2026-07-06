---
title: "Screen Sharing on Sway/Wayland with Guix"
description: "How to enable screen sharing on Sway/Wayland using Guix"
layout: blog
source:
date: 2025-09-15 0:00:00 +0000
category:
  - Tools
tags:
  - guix
  - wayland
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

This week I got tired enough, of not being able to share my screen on sway/wayland, that I decided to fix it.
Here's some of what worked; You probably don't need all of this, but it generally improves your wayland experience.

I've since switched to Niri; if that's you, see [Screen Sharing on Niri (Wayland)](/blog/screen-sharing-on-niri-wayland-with-guix/) for the updated setup.

(1) Include this in your sway config:

```bash
exec systemctl --user import-environment WAYLAND_DISPLAY XDG_CURRENT_DESKTOP
exec dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP=sway
```

(2) Make sure these packages are installed:

- `xdg-desktop-portal-wlr`
- `xdg-desktop-portal-gtk` (probably not necessary)
- `slurp`: helper to select the screen to share

(3) Create `portals.conf` config:

```toml
[preferred]
# use xdg-desktop-portal-gtk for every portal interface
default=gtk
# Settings portal for theme detection
org.freedesktop.impl.portal.Settings=gtk
# except for the xdg-desktop-portal-wlr supplied interfaces
org.freedesktop.impl.portal.ScreenCast=wlr
org.freedesktop.impl.portal.Screenshot=wlr
```

(4) Tie it all together, using guix home (or manually):

```scheme
(services
(append (list
      ;; other services
      (service home-xdg-configuration-files-service-type
                `(("sway/config" ,(local-file "sway"))
                  ("xdg-desktop-portal/portals.conf" ,(local-file "portals.conf"))))
      (simple-service 'env-vars home-environment-variables-service-type
                      `(("QT_QPA_PLATFORM" . "wayland;xcb")
                        ("SDL_VIDEODRIVER" . "wayland")
                        ("XDG_CURRENT_DESKTOP" . "sway")
                        ("XDG_SESSION_DESKTOP" . "sway")
                        ("XDG_SESSION_TYPE" . "wayland")
                        ("ELECTRON_OZONE_PLATFORM_HINT" . "wayland")
                        ("MOZ_ENABLE_WAYLAND" . "1")
                        ("NIXOS_OZONE_WL" . "1")
                        ("GDK_BACKEND" . "wayland")
                        ("CLUTTER_BACKEND" . "wayland")))
      (service home-dbus-service-type)
      (service home-pipewire-service-type))
      %base-home-services))
```

To test if it's working, use this [Test Page](https://mozilla.github.io/webrtc-landing/gum_test.html).

Feel free to checkout [my dotfiles](https://github.com/franzos/dotfiles/tree/master/home) for more details.