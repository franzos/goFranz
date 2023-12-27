---
title: "Sway with Wayland on PantherX OS"
summary: A 3-step guide on how-to try Sway Desktop in a VM on PantherX.
layout: post
source:
date: 2023-11-15 0:00:00 +0000
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

What if you wanted to try a different Desktop environment, before modifying your system?

If you're on PantherX or Guix, this takes no more than a few minutes.
In this example, I work with PantherX. Refer to [Invoking guix system: VM](https://guix.gnu.org/manual/en/html_node/Invoking-guix-system.html#index-virtual-machine) for more info.

Here's what we'll need:

1. A system configuration with sway
2. A sway config

Then we'll build an image and boot it in a VM.

System configuration `sway-system.scm`

```scheme
;; PantherX OS Desktop Configuration v2
;; boot in "legacy" BIOS mode
;; /etc/system.scm

;; guix system vm sway-system.scm

(use-modules (gnu)
             (gnu system)
             (gnu packages shells)
             (gnu packages wm)
             (gnu packages xdisorg)
             (gnu packages suckless)
             (gnu packages terminals)
             (gnu services sddm)
             (px system config))


(px-desktop-os
 (operating-system
  (host-name "px-base")
  (timezone "Europe/Berlin")
  (locale "en_US.utf8")

  (bootloader (bootloader-configuration
               (bootloader grub-bootloader)
               (targets '("/dev/sda"))))

  (file-systems (cons (file-system
                       (device (file-system-label "my-root"))
                       (mount-point "/")
                       (type "ext4"))
                      %base-file-systems))

  (users (cons (user-account
                (name "panther")
                (comment "panther's account")
                (group "users")

		;; Set the default password to 'pantherx'
                ;; Important: Change with 'passwd panther' after first login
                (password (crypt "pantherx" "$6$abc"))

                (supplementary-groups '("wheel"
                                        "audio" "video"))
                (home-directory "/home/panther"))
               %base-user-accounts))

  ;; Globally-installed packages.
  (packages (cons* sway dmenu foot
		   %px-desktop-packages))

  ;; Globally-activated services.
  (services (cons*
             (append
   	      (modify-services %px-desktop-services
     			       ;; greetd-service-type provides "greetd" PAM service
     			       (delete sddm-service-type)
     			       (delete login-service-type)
     			       ;; and can be used in place of mingetty-service-type
     			       (delete mingetty-service-type))
   	      (list
    	       (service greetd-service-type
             		(greetd-configuration
              		 (terminals
               		  (list
			   (greetd-terminal-configuration
			    (terminal-vt "1")
			    (terminal-switch #t)
			    (default-session-command
			      (greetd-wlgreet-sway-session
			       (sway-configuration
				(local-file "sway-greetd.conf")))))
			   (greetd-terminal-configuration
			    (terminal-vt "2")
			    (default-session-command
			      (greetd-agreety-session
			       (extra-env '(("MY_VAR" . "1")))
			       (xdg-env? #f))))
			   ;; we can use different shell instead of default bash
			   (greetd-terminal-configuration
			    (terminal-vt "3")
			    (default-session-command
			      (greetd-agreety-session (command (file-append zsh "/bin/zsh")))))
			   ;; we can use any other executable command as greeter
			   (greetd-terminal-configuration
			    (terminal-vt "4")
			    (default-session-command (program-file "my-noop-greeter" #~(exit))))
			   (greetd-terminal-configuration (terminal-vt "5"))
			   (greetd-terminal-configuration (terminal-vt "6"))))))))))))

```

Sway configuration `sway-greetd.conf` (the default):

```conf
# Default config for sway
#
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
# Your preferred terminal emulator
set $term foot
# Your preferred application launcher
# Note: pass the final command to swaymsg so that the resulting window can be opened
# on the original workspace that the command was run on.
set $menu dmenu_path | wmenu | xargs swaymsg exec --

### Output configuration
#
# Default wallpaper (more resolutions are available in @datadir@/backgrounds/sway/)
# output * bg @datadir@/backgrounds/sway/Sway_Wallpaper_Blue_1920x1080.png fill
#
# Example configuration:
#
#   output HDMI-A-1 resolution 1920x1080 position 1920,0
#
# You can get the names of your outputs by running: swaymsg -t get_outputs

### Idle configuration
#
# Example configuration:
#
# exec swayidle -w \
#          timeout 300 'swaylock -f -c 000000' \
#          timeout 600 'swaymsg "output * power off"' resume 'swaymsg "output * power on"' \
#          before-sleep 'swaylock -f -c 000000'
#
# This will lock your screen after 300 seconds of inactivity, then turn off
# your displays after another 300 seconds, and turn your screens back on when
# resumed. It will also lock your screen before your computer goes to sleep.

### Input configuration
#
# Example configuration:
#
#   input "2:14:SynPS/2_Synaptics_TouchPad" {
#       dwt enabled
#       tap enabled
#       natural_scroll enabled
#       middle_emulation enabled
#   }
#
# You can get the names of your inputs by running: swaymsg -t get_inputs
# Read `man 5 sway-input` for more information about this section.

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
    bindsym $mod+Shift+e exec swaynag -t warning -m 'You pressed the exit shortcut. Do you really want to exit sway? This will end your Wayland session.' -B 'Yes, exit sway' 'swaymsg exit'
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
# Status Bar:
#
# Read `man 5 sway-bar` for more information about this section.
bar {
    position top

    # When the status_command prints a new line to stdout, swaybar updates.
    # The default just shows the current date and time.
    status_command while date +'%Y-%m-%d %I:%M:%S %p'; do sleep 1; done

    colors {
        statusline #ffffff
        background #323232
        inactive_workspace #32323200 #32323200 #5c5c5c
    }
}

include @sysconfdir@/sway/config.d/*
```

To create the virtual machine image, run:

```bash
guix system vm sway-system.scm

...

building /gnu/store/m6y3b3w5nghb9naclwkyv0nl1pqah9nh-boot.drv...
building /gnu/store/v1bd60i7cc9f9rlcvsk7j2sg09p8zhqp-system.drv...
building /gnu/store/jnwha2fr1a8x9fqf8i3ai7lm5xf3bjc3-system.drv...
building /gnu/store/z9jlidjmi8w41rkw9j1qrl4287xv1cll-grub.cfg.drv...
building /gnu/store/8s98vlyy055fp8h782ig3ni9ibnpf20d-partition.img.drv...
building /gnu/store/snrijqvmb302mrhhys2dnf20y4y9a8b9-genimage.cfg.drv...
building /gnu/store/98sb8khwbp9g1gfljnzhkp15scffj85m-disk-image.drv...
building /gnu/store/11kxvwy4fnj2ckn4bfm8i7zqaplylg9r-run-vm.sh.drv...
/gnu/store/9jwyfa6bfpkhxwwglf5q74dcpnwa5kbp-run-vm.sh
```

and start the VM with (make sure to copy your path, not mine):

```bash
/gnu/store/9jwyfa6bfpkhxwwglf5q74dcpnwa5kbp-run-vm.sh -m 2048 -enable-kvm -nic user,model=virtio-net-pci
```

Leave out `-enable-kvm` or try `sudo ...` if you're getting permission errors; It will run slower though. Checkout [More Performance Using KVM](https://wiki.pantherx.org/qemu/#more-performance-using-kvm).

<img src="/assets/images/dev/sway-with-wayland-on-pantherx-1.png">

Login with username `panther` and password `pantherx`.

<img src="/assets/images/dev/sway-with-wayland-on-pantherx-2.png">

By default this works much like i3, so refer to this: [i3wm.org/docs/refcard](https://i3wm.org/docs/refcard.html).

<img src="/assets/images/dev/sway-with-wayland-on-pantherx-3.png">

I've got the terminal, qimgv and Firefox open - everything behaves well, including free-flowing windows like the qimgv preferences in the foreground.

Do not use this "as is" on your system. Cleanup and adapt to your liking, and try out in the VM first.

### More info

- [qemu](https://wiki.pantherx.org/qemu/)
- [System configuration](https://wiki.pantherx.org/System-configuration/)
