---
title: "GuixSD on DigitalOcean"
summary: "Step-by-step guide to convert a DigitalOcean Debian 9.5 droplet into a GuixSD installation, requiring at least 2GB memory for successful compilation."
layout: blog
date: 2018-11-22 00:00:00 +0200
category:
  - dev
tags:
  - linux
  - guix
  - guixsd
  - digitalocean
---

## Instructions

This guide turns a DigitalOcean Debian 9.5 Droplet into a GuixSD install.

### Set-up

In order for Guix to complete all source compilation successfully, we need at least 2GB of memory. If you don't need 2GB of memory, I suggest to start with a 1GB Droplet, which you temporarily resize to 2GB for the installation.

1. Create a new Debian 9.5 Droplet with SSH key
2. (optional) resize to 2GB now
3. SSH into your Droplet `ssh -i ~/.ssh/privatekey.pem root@...`
4. Get the current network details `ifconfig`
5. Create a new file `nano install.sh` with the following content:

Replace 3x `000.000.000.000` with the Droplet network settings.

```
apt-get update
apt-get install xz-utils -y
wget https://alpha.gnu.org/gnu/guix/guix-binary-0.15.0.x86_64-linux.tar.xz
cd /tmp
tar --warning=no-timestamp -xf ~/guix-binary-0.15.0.x86_64-linux.tar.xz
mv var/guix /var/ && mv gnu /
ln -sf /var/guix/profiles/per-user/root/guix-profile ~root/.guix-profile
GUIX_PROFILE="`echo ~root`/.guix-profile" ; source $GUIX_PROFILE/etc/profile
groupadd --system guixbuild
for i in `seq -w 1 10`; do useradd -g guixbuild -G guixbuild -d /var/empty -s `which nologin` -c "Guix build user $i" --system guixbuilder$i; done
cp ~root/.guix-profile/lib/systemd/system/guix-daemon.service /etc/systemd/system/
systemctl start guix-daemon && systemctl enable guix-daemon
guix archive --authorize < ~root/.guix-profile/share/guix/hydra.gnu.org.pub
guix pull
guix package -i openssl
cd ~/
cat <<EOF >system-config.scm
(use-modules (gnu))
(use-service-modules networking ssh)
(use-package-modules screen ssh)

;; Update your hostname and timezone
(operating-system
  (host-name "guix")
  (timezone "Asia/Tehran")
  (locale "en_US.UTF-8")

  (bootloader (bootloader-configuration
                (bootloader grub-bootloader)
                (target "/dev/vda")))
  (file-systems (cons (file-system
                        (device "/dev/vda1")
                        (mount-point "/")
                        (type "ext4"))
                      %base-file-systems))
  ;; Add your user account
  (users (cons (user-account
                (name "username")
                (group "users")
                (supplementary-groups '("wheel"))
                (home-directory "/home/username"))
               %base-user-accounts))

  ;; Globally-installed packages.
  (packages (cons* screen openssh %base-packages))

  ;; Set your Droplet, static network configuration
  (services (cons* (static-networking-service "eth0" "000.000.000.000"
                    #:netmask "000.000.000.000"
                    #:gateway "000.000.000.000"
                    #:name-servers '("84.200.69.80" "84.200.70.40"))
                   (service openssh-service-type
                            (openssh-configuration
                            (permit-root-login 'without-password)))
                   %base-services)))
EOF
guix system build system-config.scm
```

Now make it executable `chmod u+x install.sh` and run it `./install.sh`.

---

Once this completes, we rebuild the system with:

```
$ guix system reconfigure digitalocean-config.scm
```

This will fail after a couple of minutes due to `guix system: error: symlink: File exists: "/etc/ssl"`.
Now it's time to move `/etc` out of the way, and run the rebuild again.

```
$ mv /etc /old-etc
$ mkdir /etc
$ cp -r /old-etc/{passwd,group,shadow,gshadow,mtab,guix} /etc/
$ guix system reconfigure digitalocean-config.scm
```

If this completes successfully, you should get a `Installation finished. No error reported.`. Now, simply `reboot` and SSH into your Droplet again. You should be greeted with a bash command line. At this point, GuixSD is running and you may clean-up the remaining Debian pieces.

Finally, reference Guix in your profile again:

```
GUIX_PROFILE="`echo ~root`/.guix-profile" ; source $GUIX_PROFILE/etc/profile
```

## References

`Guix` is a package manager that runs on virtually any Linux.
`GuixSD` is the GNU System Distribution with `Guix` at it's core.

- [Binary Installation](https://www.gnu.org/software/guix/manual/en/html_node/Binary-Installation.html#Binary-Installation)
- [Using the Configuration System](https://www.gnu.org/software/guix/manual/en/html_node/Using-the-Configuration-System.html)

---

This guide was inspired by Andy Wingo and the experience he shared on the [guix-devel](https://lists.gnu.org/archive/html/guix-devel/2017-04/msg00139.html) mailing list.

**Update: 2022-04-09**

We've published updated scripts on our Gitlab server:

- [Guix on DigitalOcean](https://git.pantherx.org/development/applications/px-install/-/blob/master/guix-on-digitalocean.sh)
- [Guix on Hetzner Cloud](https://git.pantherx.org/development/applications/px-install/-/blob/master/pantherx-on-hetzner-cloud.sh)

These support both Ubuntu 21.04 and Debian 11, and usually finish the job within 5-10 minutes.
