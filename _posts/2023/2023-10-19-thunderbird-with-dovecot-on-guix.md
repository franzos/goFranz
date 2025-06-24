---
title: "Thunderbird with Dovecot on Guix/PantherX"
summary: Configure Thunderbird with Dovecot and a Self-Signed Certificate on Guix
layout: post
source:
date: 2023-10-19 0:00:00 +0000
category:
  - Tools
tags:
  - privacy
  - email
  - dovecot
  - thunderbird
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

This will work on both Guix and PantherX.

### System Config

It's easy to run a local `dovecot` server:

Add this to the service section of your system config (`/etc/system.scm`):

```scheme
(dovecot-service #:config
                 (dovecot-configuration
                  (mail-location "maildir:~/.mail")))
```

Reconfigure with:

```bash
guix system reconfigure /etc/system.scm
```

Make sure to include `~/.mail` in your backup.

#### Authentication

Defaults to [PAM authentication](https://doc.dovecot.org/configuration_manual/authentication/pam/), so you can simply login with your linux account username and password.

### Thunderbird

Add a new account with the following settings:

- Username: your linux username
- Password: your linux password

Select advanced settings

- Server Name: `localhost`
- Port `993`
- Connection security: `SSL/TLS`
- Authentication method: `Normal password`

Now open the config editor: Settings -> Search for "Config" and "Config Editor ..."

1. Search for `network.security.ports.banned.override`
2. Select `string`
3. Edit and add `993`
4. Restart Thunderbird

Now go to Settings -> Privacy & Security -> Certificates -> Manage Certificates -> Servers.

<img src="/assets/images/blog/thunderbird-with-dovecot-on-guix.png">

Add a new exception for `localhost:993`. Confirm.

At this point, you should be able to access the dovecot server on localhost with a self-signed certificate.

### Troubleshooting

Consult the logs:

```bash
tail -f /var/log/maillog
```

Try with mutt, a command line client:

```bash
mutt -f imaps://<your_username>@localhost
```

### References

- [https://guix.gnu.org/manual/en/html_node/Mail-Services.html](https://guix.gnu.org/manual/en/html_node/Mail-Services.html)
- [https://bugzilla.mozilla.org/show_bug.cgi?id=1764770#c49](https://bugzilla.mozilla.org/show_bug.cgi?id=1764770#c49)
- [https://superuser.com/a/1776217/1853517](https://superuser.com/a/1776217/1853517)
