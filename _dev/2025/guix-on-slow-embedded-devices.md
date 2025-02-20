---
title: "GUIX on slow, embedded devices"
summary: "This post goes over how to use guix on a slow, embedded device, without actually running guix on it."
layout: post
source:
date: 2025-2-20 0:00:00 +0000
category:
  - Tools
tags:
  - development
  - embedded
  - guix
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I recently found myself working on a embedded project based on a Raspberry Pi compute module. The goal of this project was to customize the software stack of the device, to provide a personalized experience, and make it easy to maintain. 

As I already use guix on all other client machines, my first thought was to power this device with guix as well. The declarative system configuration, smooth remote updates and reconfiguration are just too good to pass up. Unfotunately there's two problems:

- The device requires custom kernel and overlays, that need maintenance
- Computing guix changes, can be very resource intensive

Because some of the software that we were planning to run on the device, is already packaged for guix, and provided via private channel, I didn't want to go through the effort to maintain separate Debian packages; After all, we already have a build pipeline for guix ARM/x86 packages.

Fortunately, guix is extremely flexible; The options are:

1. Run guix as distribution (Originally GuixSD)
2. Run guix, the package manager, on a foreign distro
3. Use guix, to generate an image, which can be flashed to the device
4. Use `guix pack`, to generate the store at a specific commit

Option 1. and 2. were out, because the device is too slow; 3. would make remote updates impossible, but 4. might just work...

I decided to come-up with a poor-mans guix experience:

- A current guix store at `/gnu.active`
- A fallback (roll-back) store at `/gnu.inactive`
- A guix store at an expected standard location `/gnu` which symlinks to `/gnu.active`
- Finally, a profile that applications refer to at `/srv/.guix-profile` which symlinks to `/gnu/store/...-profile`

Here's what this looks like, when it's done:

```bash
$ ls /srv/.guix-profile
bin  etc  include  lib	libexec  manifest  sbin  share
```

### Package

I generate the archive from a simple guix package, that includes all required applications and preferences:

```scheme
(define-public bluetooth-terminal-assets
  (package
   (name "bluetooth-terminal-assets")
   (version "2.0.0")
   (source
    (origin
     (method url-fetch)
     (uri (string-append "https://source.*.org/" name "_v" version ".tgz"))
     (sha256
      (base32 "0r8x5wj4asw6l0hrg4m0s9l6yf5b332gmrqaz8ba836bff85g537"))))
   (build-system trivial-build-system)
   (arguments
    `(#:modules ((guix build utils))
      #:builder
      (begin
        (use-modules (guix build utils))
        (let ((tar (assoc-ref %build-inputs "tar"))
              (gzip (assoc-ref %build-inputs "gzip"))
              (src (assoc-ref %build-inputs "source"))
              (out-dir (string-append %output "/etc/vhh")))
          (mkdir-p out-dir)
          (setenv "PATH" (string-append gzip "/bin"))
          (invoke (string-append tar "/bin/tar") "xvf" src "-C" out-dir "--strip-components=1")
          #t))))
   (native-inputs
    `(("tar" ,tar)
      ("gzip" ,gzip)))
   (propagated-inputs (list polybar
                            sox
                            guix
                            bcms
                            bpms
                            dunst
                            svkbd
                            neovim
                            kdialog
                            libnotify
                            nss-certs
                            system-stats
                            glibc-locales
                            state-massage
                            usb-bpm-exporter
                            matrix-client-call-auto-accept
                            bluetooth-terminal-alerts
                            bluetooth-terminal-assigned-user
                            px-device-identity
                            px-device-identity-service))
   (synopsis "Contains assets for bluetooth-terminal")
   (description "Configuration, scripts and other assets")
   (license license:expat)))
```

To pack the latest version to a tarball, the build server invokes:

```bash
guix pack -RR bluetooth-terminal-assets
```

### Update Device

Here's the script that takes the archive as input, and updates the guix store:

```bash
#!/usr/bin/bash
. /etc/profile

UPDATE_FILE_PATH=$1

# Check if the file exists
if [ ! -f "$UPDATE_FILE_PATH" ]; then
    echo "Error: File '$UPDATE_FILE_PATH' does not exist."
    exit 1
fi

# Check if the file has a .tar.gz extension
if [[ "$UPDATE_FILE_PATH" != *.tar.gz ]]; then
    echo "Error: File '$UPDATE_FILE_PATH' is not a .tar.gz archive."
    exit 1
fi

set -e  # Exit on any error

ACTIVE_ROOT="/gnu.active"
INACTIVE_ROOT="/gnu.inactive"
GNU_LINK="/gnu"

# 1. Clean inactive directory
rm -rf "$INACTIVE_ROOT"
mkdir -p "$INACTIVE_ROOT"

# 2. Extract new archive to inactive directory using pv if available
if command -v pv >/dev/null 2>&1; then
    pv "$UPDATE_FILE_PATH" | tar xzf - -C "$INACTIVE_ROOT" --strip-components=2
else
    tar xzf "$UPDATE_FILE_PATH" -C "$INACTIVE_ROOT" --strip-components=2
fi

# 3. Atomic switch using symlink
ln -sfn "$INACTIVE_ROOT" "$GNU_LINK.tmp"
mv -Tf "$GNU_LINK.tmp" "$GNU_LINK"

# 4. Swap active/inactive directories for next update
mv "$ACTIVE_ROOT" "$ACTIVE_ROOT.old"
mv "$INACTIVE_ROOT" "$ACTIVE_ROOT"
mv "$ACTIVE_ROOT.old" "$INACTIVE_ROOT"

# 5. Update Guix profile symlink
GUIX_PROFILE=$(find "$GNU_LINK/store" -maxdepth 1 -type d -name '*-profile' | head -n1)
if [ -n "$GUIX_PROFILE" ]; then
    ln -sfn "$GUIX_PROFILE" /srv/.guix-profile
    source "$GUIX_PROFILE/etc/profile"
else
    echo "Warning: No Guix profile found in $GNU_LINK/store"
fi
```

Additionally, to make applications available on the user terminal, I added these two lines to the `.profile` of every user:

```bash
export GUIX_PROFILE=$(find /gnu/store -maxdepth 1 -type d -name '*-profile' | head -n1)
source $GUIX_PROFILE/etc/profile
```

Finally, to move some files into place, and interact with systemd, I wrote a small utility [state-massage](https://github.com/franzos/state-masssage). It sources the changes from `/srv/.guix-pofile` and makes sure everything else is in place. Here's a excerpt of what this looks like:

```ini
[task.1]
title = Create Openbox configuration
opt = copy
src = files/rc.xml
dest = /home/default/.config/openbox/rc.xml
chown = default:default
mode = 0644

[task.2]
title = Set motd content
opt = copy
src = files/motd
dest = /etc/motd

[task.3]
title = Install System Stats Service
opt = copy
src = files/system-stats.service
dest = /etc/systemd/system/system-stats.service

[task.4]
title = Reload systemd and enable System Stats Service
opt = systemd
daemon_reload = yes
enabled = yes
state = active
name = system-stats.service
```

The application is executed like so:

```bash
state-massage --operation run --tasks-path "/srv/.guix-profile/etc/client/tasks.ini"
```

### Remote Updates

I have an additional script in place, that checks the channel for package updates, downloads the new archive and executes the update script, and `state-massage`. The whole process takes about ~10 minutes, which is acceptable here. It's not as fast as relying on Debian packages, but 10x faster, than running a `guix pull` on this device.

### Conclusion

Using guix is not the optimal approach here, but it provides a predicable experience and saves me from having to maintain seperate packages and build pipeline for Debian.