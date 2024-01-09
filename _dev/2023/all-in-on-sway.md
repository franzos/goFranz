---
title: "All in on Sway with Guix"
summary: Notes on what I have installed, and how-to fix things.
layout: post
source:
date: 2023-12-27 0:00:00 +0000
category:
  - Tools
tags:
  - pantherx
  - sway
  - wayland
  - linux
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

So, as the title says - all-in.
Posted an initial [screenshot](https://social.tchncs.de/@franzs/111651836583654818) on Mastodon.

I'm coming from LXQt which I was quite happy with, but after years of making desktops work, I've come to wonder what a desktop really needs; Turns out it doesn't need much - in fact, for the most part, it needs less. That being said, here it goes:

### Configuration

I haven't cleaned this up yet and might come-back later to supply more info; It's just an excerpt to get you started.
Refer to [Sway with Wayland on PantherX OS](/dev/sway-with-wayland-on-pantherx/) to try this in A VM instead.

This is based on PantherX OS but you can easily replicate this on guix.

#### Packages

Start with a standard desktop config, then:

1. Modify `%px-desktop-core-services` -> `%custom-desktop-services`
2. Add packages you want; extending ` %px-desktop-core-packages`
3. Add services you want; extending our new `%custom-desktop-services`

[file on GitHub](https://raw.githubusercontent.com/franzos/dotfiles/979c9f0862c8cbee845ad13c887d9fe6e06c4475/system.scm)

#### Sway

Here's the related config, for use at `~/.config/sway/config`

[file on GitHub](https://raw.githubusercontent.com/franzos/dotfiles/979c9f0862c8cbee845ad13c887d9fe6e06c4475/sway)

### Manual Fixes

#### Network Manager

I had issues running nmtui; Here's how to fix it:

```bash
TERM=foot nmtui
```

#### Foot: Unknown Terminal

When you use `sudo` or `ssh` to another host with foot, you might get an error about unknown terminal. This fixes it temporarily:

```bash
TERM=xterm nano
```

You could also use `alacritty` and others instead of `foot` for now.

#### Scaling: Blurry Applications

##### Chrome

1. chrome://flags/
2. ozone-platform-hint -> 'wayland'

##### VScode & Code

```bash
cp /home/franz/.guix-profile/share/applications/vscode.desktop ~/.local/share/applications
cp /home/franz/.guix-profile/share/applications/vscodium.desktop ~/.local/share/applications
```

Modify entry from (example):

```
[Desktop Entry]
Name=Visual Studio Code
Comment=Code Editing. Redefined.
GenericName=Text Editor
Exec=/gnu/store/3m7yfw3v9adlhysa36w5vfl2v6swfgvl-vscode-1.84.2/opt/vscode/bin/code
Icon=vscode
Type=Application
StartupNotify=true
StartupWMClass=Code
Categories=TextEditor;Development;IDE;
Actions=new-empty-window;
Keywords=vscode;
```

to

```
[Desktop Entry]
Name=Visual Studio Code WAYLAND
Comment=Code Editing. Redefined.
GenericName=Text Editor
Exec=/gnu/store/3m7yfw3v9adlhysa36w5vfl2v6swfgvl-vscode-1.84.2/opt/vscode/bin/code --enable-features=UseOzonePlatform,WaylandWindowDecorations --ozone-platform=wayland
Icon=vscode
Type=Application
StartupNotify=true
StartupWMClass=Code
Categories=TextEditor;Development;IDE;
Actions=new-empty-window;
Keywords=vscode;
```

The `WAYLAND` is entirely optional; Important are the additional arguments.
Of course you'll have to update these, with every related update; I tried using `~/.guix-profile` path but it crashes right away.


If `code` crashes:
- start without args, change setting `window.titleBarStyle` from `native` to `custom`, then try again (crashes with 2x or more windows)
- OR change startup args to only --enable-features=WaylandWindowDecorations

##### Electron in general

Found this on the [Arch Wiki](https://wiki.archlinux.org/title/Wayland#Electron), but doesn't seem to have any effect eventhough the Electron release matches.

Path: `~/.config/electron25-flags.conf`

```
--enable-features=WaylandWindowDecorations
--ozone-platform-hint=auto
```

Path: `~/.config/electron13-flags.conf`

```
--enable-features=UseOzonePlatform
--ozone-platform=wayland
```

Not clear whether these work though; VSCode is Electron 25 but these don't apply.

#### Keyboard

Check the name of a key with `wev`, to assign shortcuts.

#### Display

I have two display's, and I want them to turn on/off automatically.

Path: `~/.config/kanshi/config`

```
profile {
        output eDP-1 disable
        output DP-2 mode 2560x1440 position 0,0 scale 1.5
}

profile {
        output eDP-1 enable mode 2560x1440 position 0,0
}
```

#### Theme

Path: `.config/gtk-3.0/settings.ini`

I still had an old, theme file:

```
# Created by lxqt-config-appearance (DO NOT EDIT!)
[Settings]
gtk-theme-name = Breeze-Dark
gtk-icon-theme-name = breeze-dark
# GTK3 ignores bold or italic attributes.
gtk-font-name = IBM Plex Sans 9
gtk-menu-images = 1
gtk-button-images = 1
gtk-toolbar-style = GTK_TOOLBAR_BOTH
gtk-cursor-theme-name = Paper
gtk-cursor-theme-size = 30
```

Adjusted to this:

```
[Settings]
gtk-theme-name = Yaru
gtk-application-prefer-dark-theme = 1
gtk-cursor-theme-name = Yaru
gtk-cursor-theme-size = 30
gtk-icon-theme-name = Yaru
gtk-fallback-icon-theme = gnome
gtk-font-name = IBM Plex Sans 9
gtk-xft-antialias = 1
gtk-enable-animations = true
gtk-button-images = 1
gtk-menu-images = 1
gtk-toolbar-style = GTK_TOOLBAR_BOTH
```

Found another here:

Path: `~/.gtkrc-2.0`

```
# Created by lxqt-config-appearance (DO NOT EDIT!)
gtk-theme-name = "Breeze-Dark"
gtk-icon-theme-name = "breeze-dark"
gtk-font-name = "IBM Plex Sans 9"
gtk-button-images = 1
gtk-menu-images = 1
gtk-toolbar-style = GTK_TOOLBAR_BOTH
gtk-cursor-theme-name = Paper
gtk-cursor-theme-size = 30
```

Adjusted to this:

```
gtk-theme-name = "Yaru"
gtk-icon-theme-name = "Yaru"
gtk-font-name = "IBM Plex Sans 9"
gtk-button-images = 1
gtk-menu-images = 1
gtk-toolbar-style = GTK_TOOLBAR_BOTH
gtk-cursor-theme-name = "Yaru"
gtk-cursor-theme-size = 30
````

##### Dark theme for Gnome-apps

```bash
guix package -i glib:bin
gsettings set org.gnome.desktop.interface color-scheme prefer-dark
```

##### Installed Icons

Here's where you can find what's available:

```bash
$ ls /run/current-system/profile/share/icons/
ePapirus/
ePapirus-Dark/
handhelds/
hicolor/
HighContrast/
Paper/
Paper-Mono-Dark/
Papirus/
Papirus-Dark/
Papirus-Light/
redglass/
whiteglass/
Yaru/
Yaru-bark/
Yaru-bark-dark/
Yaru-blue/
Yaru-blue-dark/
Yaru-dark/
Yaru-magenta/
Yaru-magenta-dark/
Yaru-mate/
Yaru-mate-dark/
Yaru-olive/
Yaru-olive-dark/
Yaru-prussiangreen/
Yaru-prussiangreen-dark/
Yaru-purple/
Yaru-purple-dark/
Yaru-red/
Yaru-red-dark/
Yaru-sage/
Yaru-sage-dark/
Yaru-viridian/
Yaru-viridian-dark/
```

#### Flatpak

To have Flatpak-installed application show-up in bemenu, add this to `~/.profile`:

```bash
source ~/.guix-profile/etc/profile.d/flatpak.sh
```

#### Mounting stuff

Just drop this in your sway config

```bash
udiskie
```

It's your friend; even for encrypted stuff.

#### SSH

If you don't want to enter your SSH key every time, add this to `~/.bashrc`:

```bash
eval `keychain --eval --agents ssh your_ssh_key_name`
```

It looks for the key in `~/.ssh/your_ssh_key_name`, and when you open a new terminal, it should look like this:

```
 * keychain 2.8.5 ~ http://www.funtoo.org
 * Found existing ssh-agent: 14412
 * Known ssh key: /home/franz/.ssh/your_ssh_key_name
```

#### Suspend

For quick suspend via bemenu, I created a desktop file `.local/share/applications/suspend.desktop`:

```
[Desktop Entry]
Encoding=UTF-8
Version=1.0
Type=Application
Exec=loginctl suspend
Name=Suspend
Comment=Suspend PC
Icon=application-exit
NoDisplay=false
Categories=Utilities;System
```

Of course you can do this for other things like lock, shutdown, ...

#### File Manager

I just prefer a GUI for now; both `thunar` (Xfce) and `nautilus` (Gnome) work good, others should as well.

#### Audio

I finally replaced ALSA and Pulseaudio with pipewire; Thanks to guix home this is really easy. Here's how this looks like:

[file on GitHub](https://raw.githubusercontent.com/franzos/dotfiles/979c9f0862c8cbee845ad13c887d9fe6e06c4475/home.scm)

----

This is hardly final, or perfect. Good luck :)

Edits:
- 01.06.2024: Linked to files on GitHub; added notes on pipewrite
