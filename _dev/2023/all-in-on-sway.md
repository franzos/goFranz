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

```scheme
(define %custom-desktop-services
  (modify-services %px-desktop-core-services
    ;;(delete sddm-service-type)
    (delete login-service-type)
    (delete mingetty-service-type)

    (sysctl-service-type config =>
                         (sysctl-configuration 
                          (inherit config)
                          (settings (append '(("fs.inotify.max_user_watches>
                                             %default-sysctl-settings))))))

  ;;
  ;; OTHER STUFF like kernel, fs, ...;;
  ;;
  
  (packages
   (cons*
    emacs
    throttled
    docker
    containerd
    docker-cli
    libinput

    ;; sway
    sway
    swayidle ;; idle handling
    swaylock ;; lockscreen
    swaybg ;; backgrunds
    bemenu ;; quickstart menu
    j4-dmenu-desktop ;flatpak apps in bemenu
    foot ;terminal
    waybar ;status bar
    dunst ;notifications
    wlr-randr
    kanshi ;display management
    wl-clipboard
    clipman
    font-awesome
    grim ;screenshot
    swappy ;screenshot editor

    pavucontrol ;pulseaudio gui
    pamixer ;keyboard volume
    brightnessctl ;keyboard backlight

    wf-recorder ;screen recording
    mpv ;media player

    xdg-desktop-portal-wlr
    yaru-theme
    hicolor-icon-theme
    papirus-icon-theme
    gnome-themes-extra
    adwaita-icon-theme
    xsettingsd ;; xwaland, java
 
    gvfs ;; mounts - probably not needed
    udiskie ;; auto-mounts

    ;; gnome apps
    glib:bin ;; gsettings
    dconf ;; gsettings backend
    nautilus ;; fle manager 
    evince ;; pdfs

    keychain ;; ssh / gpg

    ;; xfce apps
    xfconf ;; persist thunar changes
    ;; thunar

    ;; media
    mpv ;; video
    qimgv ;; images

    %px-desktop-core-packages))

  ;; Services
  (services
   (cons*

    (service screen-locker-service-type
             (screen-locker-configuration
              (name "swaylock")
              (program (file-append xlockmore "/bin/xlock"))))

    (service greetd-service-type
             (greetd-configuration
              (terminals
               (list
                (greetd-terminal-configuration
                 (terminal-vt
                  "1")
                 (terminal-switch
                  #t)
                 (default-session-command
                   (greetd-wlgreet-sway-session
                    (sway-configuration
                     (local-file
                      "sway-greetd.conf")))))
                ;; Do whatever you want with this; left it here as an example
                (greetd-terminal-configuration
                 (terminal-vt
                  "2")
                 (default-session-command
                   (greetd-agreety-session
                    (extra-env '
                     (("MY_VAR" . "1")))
                    (xdg-env?
                     #f))))
                ;; we can use different shell instead of default bash
                (greetd-terminal-configuration
                 (terminal-vt
                  "3")
                 (default-session-command
                   (greetd-agreety-session
                    (command
                     (file-append
                      zsh
                      "/bin/zsh")))))
                ;; we can use any other executable command as greeter
                (greetd-terminal-configuration
                 (terminal-vt
                  "4")
                 (default-session-command
                   (program-file
                    "my-noop-greeter"
                    #~
                    (exit))))
                (greetd-terminal-configuration
                 (terminal-vt
                  "5"))
                (greetd-terminal-configuration
                 (terminal-vt
                  "6"))))))

    (service unattended-upgrade-service-type
             (unattended-upgrade-configuration
              (schedule
               "0 12 * * *")
              (channels #~
                        (cons*
                         (channel
                          (name 'pantherx)
                          (branch "master")
                          (url "https://channels.pantherx.org/git/panther.git")
                          (introduction
                           (make-channel-introduction
                            "54b4056ac571611892c743b65f4c47dc298c49da"
                            (openpgp-fingerprint
                             "A36A D41E ECC7 A871 1003  5D24 524F EB1A 9D33 C9CB"))))
                         %default-channels))))

    %custom-desktop-services)))
```

#### Sway

Here's the related config, for use at `~/.config/sway/config`

```
# Read `man 5 sway` for a complete reference.

### Variables
#
# Logo key. Use Mod1 for Alt.
set $mod Mod4
# Home row direction keys, like vim
set $left h
set $down j
set $up k
set $right l

# Terminal
set $term foot

# App launcher
set $menu dmenu_path | j4-dmenu-desktop --dmenu="bemenu --ignorecase" | xargs swaymsg exec --

# Display management
# .config/kanshi/config
exec kanshi

# Clipboard
# exec wl-paste -t text --watch clipman store --no-persist
exec wl-paste --watch clipman store --no-persist

# Notifications
exec dunst

# Disk mounting
exec udiskie

#  
exec xsettingsd

# Wallpaper
output "*" bg ~/Desktop/Wallpaper/sebastian-staines-Jk4b7zztsek-unsplash.jpg fill

# Theme for Gnome-apps
set $gnome-schema org.gnome.desktop.interface
exec_always {
    gsettings set $gnome-schema gtk-theme 'Yaru'
    gsettings set $gnome-schema icon-theme 'Yaru'
    gsettings set $gnome-schema cursor-theme 'Yaru'
    gsettings set $gnome-schema font-name 'IBM Plex Sans 9'
}

### Auto-float
# https://wiki.gentoo.org/wiki/Sway
for_window [window_role = "pop-up"] floating enable
for_window [window_role = "bubble"] floating enable
for_window [window_role = "dialog"] floating enable
for_window [window_type = "dialog"] floating enable
for_window [window_role = "task_dialog"] floating enable
for_window [window_type = "menu"] floating enable
for_window [app_id = "floating"] floating enable
for_window [app_id = "floating_update"] floating enable, resize set width 1000px height 600px
for_window [class = "(?i)pinentry"] floating enable
for_window [title = "Administrator privileges required"] floating enable

for_window [title = "About Mozilla Firefox"] floating enable
for_window [window_role = "About"] floating enable
for_window [app_id="firefox" title="Library"] floating enable, border pixel 1, sticky enable

for_window [title = "Firefox - Sharing Indicator"] kill
for_window [title = "Firefox — Sharing Indicator"] kill

for_window [class="^Steam$" title="^Friends$"] floating enable
for_window [class="^Steam$" title="Steam - News"] floating enable
for_window [class="^Steam$" title=".* - Chat"] floating enable
for_window [class="^Steam$" title="^Settings$"] floating enable
for_window [class="^Steam$" title=".* - event started"] floating enable
for_window [class="^Steam$" title=".* CD key"] floating enable
for_window [class="^Steam$" title="^Steam - Self Updater$"] floating enable
for_window [class="^Steam$" title="^Screenshot Uploader$"] floating enable
for_window [class="^Steam$" title="^Steam Guard - Computer Authorization Required$"] floating en>
for_window [title="^Steam Keyboard$"] floating enable

for_window [shell="xwayland"] title_format "%title [XWayland]"

### Idle configuration
exec swayidle -w \
    timeout 300 'swaylock -f -c 000000' \
    timeout 600 'swaymsg "output * power off"' resume 'swaymsg "output * power on"' \
    before-sleep 'swaylock -f -c 000000'

### Input configuration
input type:touchpad {
    tap enabled
}

### Key bindings
#
# Basics:
#
    # Start a terminal
    bindsym $mod+Return exec $term

    # Kill focused window
    bindsym $mod+Shift+q kill

    # Start your launcher
    bindsym $mod+d exec $menu

    # Drag floating windows by holding down $mod and left mouse button.
    # Resize them with right mouse button + $mod.
    # Despite the name, also works for non-floating windows.
    # Change normal to inverse to use left mouse button for resizing and right
    # mouse button for dragging.
    floating_modifier $mod normal


    # Reload the configuration file
    bindsym $mod+Shift+c reload

    # Exit sway (logs you out of your Wayland session)
    bindsym $mod+Shift+e exec swaynag -t warning -m 'You pressed the exit shortcut. Do you reall>
#
# Moving around:
#
    # Move your focus around
    bindsym $mod+$left focus left
    bindsym $mod+$down focus down
    bindsym $mod+$up focus up
    bindsym $mod+$right focus right
    # Or use $mod+[up|down|left|right]
    bindsym $mod+Left focus left
    bindsym $mod+Down focus down
    bindsym $mod+Up focus up
    bindsym $mod+Right focus right

    # Move the focused window with the same, but add Shift
    bindsym $mod+Shift+$left move left
    bindsym $mod+Shift+$down move down
    bindsym $mod+Shift+$up move up
    bindsym $mod+Shift+$right move right
    # Ditto, with arrow keys
    bindsym $mod+Shift+Left move left
    bindsym $mod+Shift+Down move down
    bindsym $mod+Shift+Up move up
    bindsym $mod+Shift+Right move right

#
# Workspaces:
#
    # Switch to workspace
    bindsym $mod+1 workspace number 1
    bindsym $mod+2 workspace number 2
    bindsym $mod+3 workspace number 3
    bindsym $mod+4 workspace number 4
    bindsym $mod+5 workspace number 5
    bindsym $mod+6 workspace number 6
    bindsym $mod+7 workspace number 7
    bindsym $mod+8 workspace number 8
    bindsym $mod+9 workspace number 9
    bindsym $mod+0 workspace number 10
    # Move focused container to workspace
    bindsym $mod+Shift+1 move container to workspace number 1
    bindsym $mod+Shift+2 move container to workspace number 2
    bindsym $mod+Shift+3 move container to workspace number 3
    bindsym $mod+Shift+4 move container to workspace number 4
    bindsym $mod+Shift+5 move container to workspace number 5
    bindsym $mod+Shift+6 move container to workspace number 6
    bindsym $mod+Shift+7 move container to workspace number 7
    bindsym $mod+Shift+8 move container to workspace number 8
    bindsym $mod+Shift+9 move container to workspace number 9
    bindsym $mod+Shift+0 move container to workspace number 10
    # Note: workspaces can have any name you want, not just numbers.
    # We just use 1-10 as the default.
#
# Layout stuff:
#
    # You can "split" the current object of your focus with
    # $mod+b or $mod+v, for horizontal and vertical splits
    # respectively.
    bindsym $mod+b splith
    bindsym $mod+v splitv

    # Switch the current container between different layout styles
    bindsym $mod+s layout stacking
    bindsym $mod+w layout tabbed
    bindsym $mod+e layout toggle split

    # Make the current focus fullscreen
    bindsym $mod+f fullscreen

    # Toggle the current focus between tiling and floating mode
    bindsym $mod+Shift+space floating toggle

    # Swap focus between the tiling area and the floating area
    bindsym $mod+space focus mode_toggle

    # Move focus to the parent container
    bindsym $mod+a focus parent
#
# Scratchpad:
#
    # Sway has a "scratchpad", which is a bag of holding for windows.
    # You can send windows there and get them back later.

    # Move the currently focused window to the scratchpad
    bindsym $mod+Shift+minus move scratchpad

    # Show the next scratchpad window or hide the focused scratchpad window.
    # If there are multiple scratchpad windows, this command cycles through them.
    bindsym $mod+minus scratchpad show
#
# Resizing containers:
#
mode "resize" {
    # left will shrink the containers width
    # right will grow the containers width
    # up will shrink the containers height
    # down will grow the containers height
    bindsym $left resize shrink width 10px
    bindsym $down resize grow height 10px
    bindsym $up resize shrink height 10px
    bindsym $right resize grow width 10px

    # Ditto, with arrow keys
    bindsym Left resize shrink width 10px
    bindsym Down resize grow height 10px
    bindsym Up resize shrink height 10px
    bindsym Right resize grow width 10px

    # Return to default mode
    bindsym Return mode "default"
    bindsym Escape mode "default"
}
bindsym $mod+r mode "resize"

#
# Functional keys:
#

    bindsym XF86MonBrightnessUp exec brightnessctl set +5%
    bindsym XF86MonBrightnessDown exec brightnessctl set 5%-

    bindsym XF86AudioRaiseVolume exec pamixer -u -i 5
    bindsym XF86AudioLowerVolume exec pamixer -d 5
    bindsym XF86AudioMute exec pamixer -t
    bindsym XF86AudioMicMute exec pamixer --default-source -t

    bindsym XF86AudioPlay exec playerctl play-pause
    bindsym XF86AudioNext exec playerctl next
    bindsym XF86AudioPrev exec playerctl previous

    bindsym Print exec grim - | swappy -f -

bar {
        swaybar_command waybar
}

include @sysconfdir@/sway/config
```

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
Exec=/gnu/store/3m7yfw3v9adlhysa36w5vfl2v6swfgvl-vscode-1.84.2/opt/vscode/bin/code --enable-feat>
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


If `code` crashes, start without args, change setting `window.titleBarStyle` from `native` to `custom`, then try again. To be honest, this is much nicer anyway ;)

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

----

This is hardly final, or perfect. Good luck :)
