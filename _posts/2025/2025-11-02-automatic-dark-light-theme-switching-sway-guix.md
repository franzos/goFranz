---
title: "Automatic Dark/Light Theme Switching on Sway with Guix"
summary: "How to automatically switch between dark and light themes based on time of day using darkman on Sway/Wayland with Guix"
layout: blog
source:
date: 2025-11-02 0:00:00 +0000
category:
  - Tools
tags:
  - guix
  - sway
  - darkman
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I've been meaning to set up automatic theme switching for a while now. Manually toggling between dark and light themes gets old fast, especially when I'm working across different times of day. Enter darkman - a simple daemon that handles this automatically.

## What is Darkman?

[Darkman](https://darkman.whynothugo.nl/) is a framework for dark-mode and light-mode transitions. It automatically switches themes at sunrise and sunset based on your location, and lets you manually toggle when needed. The beauty is in its simplicity: it runs scripts when switching modes, so you can control exactly what changes.

## Guix Home Setup

On Guix, darkman integrates via a home service. Add this to your home configuration:

```scheme
(service home-darkman-service-type
         (home-darkman-configuration
          (latitude 38.7)
          (longitude -9.2)
          (use-geoclue? #f)))
```

Set your latitude and longitude to get accurate sunrise/sunset times. I disable geoclue since I don't need dynamic location tracking.

## What Gets Switched

Darkman will handle:

- **GTK applications**: LibreOffice, Thunar, file managers (Yaru-dark ↔ Yaru theme)
- **Foot terminal**: Instant color switching via UNIX signals
- **Dunst notifications**: Background and foreground colors

## The Implementation

Darkman executes scripts from two directories:
- `~/.local/share/dark-mode.d/` - runs when switching to dark mode
- `~/.local/share/light-mode.d/` - runs when switching to light mode

For GTK apps, scripts update gsettings and swap configuration files:

```bash
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
gsettings set org.gnome.desktop.interface gtk-theme 'Yaru-dark'

# Copy dark theme template to active config
TEMPLATE="$HOME/.local/share/gtk-themes/settings-dark.ini"
GTK3_CONFIG="$HOME/.config/gtk-3.0/settings.ini"
cp "$TEMPLATE" "$GTK3_CONFIG"
```

The gsettings commands communicate via dbus, broadcasting the color-scheme preference (`org.freedesktop.appearance.color-scheme`). This updates the GTK apps shown above, but also notifies any modern application listening to this portal - browsers like Firefox and Chrome, VSCode, and others all switch automatically without needing darkman scripts.

For the Foot terminal I run `foot --server` and connect with `footclient`. This lets me use signals for instant theme switching - one signal updates the server and all connected terminals without restart:

```bash
# Dark mode: SIGUSR1 switches to [colors] section
kill -SIGUSR1 $(pgrep -x foot) 2>/dev/null || true

# Light mode: SIGUSR2 switches to [colors2] section
kill -SIGUSR2 $(pgrep -x foot) 2>/dev/null || true
```

Your `foot.ini` just needs both color sections defined, with `initial-color-theme=1` to start dark.

## Usage

Once configured, darkman runs automatically:
- Switches to light mode at sunrise
- Switches to dark mode at sunset
- Manual toggle with `darkman toggle` (I bind this to `Mod+T` in Sway)

Test it works:

```bash
darkman toggle
```

Everything should switch instantly - GTK apps, terminal colors, notifications.

## Full Implementation

The complete setup with all scripts and configurations is in my [dotfiles repository](https://github.com/franzos/dotfiles).
