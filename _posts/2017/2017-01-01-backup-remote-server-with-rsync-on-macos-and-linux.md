---
title: Backup a remote server with Rsync on macOS or Linux
summary: "How to use Rsync for incremental backups of remote servers on macOS or Linux systems."
layout: blog
version:
os:
  - macOS
  - Linux
source:
date: 2017-01-01 00:00:00 +0200
category:
  - dev
  - backup
tags:
  - backup
  - macOS
  - linux
---

Rsync is perfect to incrementally backup a remote server on macOS or Linux:

`rsync -a user@128.138.148.15:/srv/users/username/apps/sync-this "/Volumes/Server Backup/"`

`rsync` The program we're using
<br>`-a` _archive mode_
<br>`user` The user we're using to connect to the server.
<br>`@128.138.148.15` The server we're connecting to.
<br>`:/srv/users/username/apps/sync-this` The folder you want to backup.
<br>`"/Volumes/Server Backup/"` The - local - backup destination.

The reason I'm using the quotation mark for `"/Volumes/Server Backup/"` is that there's a space between _Server_ and _Backup_.
