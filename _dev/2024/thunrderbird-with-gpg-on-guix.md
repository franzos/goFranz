---
title: "Thunderbird, Guix and GPG"
summary: Notes on how-to get Thunderbird to recognize a Yubikey GPG key on Guix
layout: post
source:
date: 2024-07-07 0:00:00 +0000
category:
  - Tools
tags:
  - thunderbird
  - gpg
  - linux
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

A quick note in case anybody else runs into this:

1. Enable external GPG support
2. Add your GPG key ID
3. Import your public key
4. Make sure Thunderbird can access the key

### Enable external GPG support

First of all, open the config editor and make sure these are `true`:

```bash
mail.openpgp.allow_external_gnupg
mail.openpgp.fetch_pubkeys_from_gnupg
```

### Add your GPG key ID

Then find your GPG key ID with `gpg --list-keys`, and add it to Thunderbird:

- Account: End-To-End Encryption: Add Key
- Use your external key trough GnuPG
- Enter the 16-character key ID (ex `C070BF1246CBFB41`)

### Import your public key

Next, export your public key from GPG and import it:

```bash
gpg --armor --export C070BF1246CBFB41 > pubkey.asc
```

I couldn't get Thunderbird to import the file, so here's what I did:

- `cat pubkey.asc` and copy to clipboard
- Open OpenPGP Key Manager in Thunderbird
- Edit: Import keys from clipboard

### Make sure Thunderbird can access the key

Finally, make sure Thunderbird can actually access the key; For this we need to add `gpgme` to the environment. I created a new desktop entry, to handle this step automatically:

```bash
[Desktop Entry]
Name=Icedove GPG
Exec=LD_LIBRARY_PATH="$(guix build gpgme)/lib" icedove %u
Icon=icedove
GenericName=Mail/News Client
Categories=Network;Email;
Terminal=false
StartupNotify=true
MimeType=x-scheme-handler/mailto;
Type=Application
Actions=ComposeMessage;
[Desktop Action ComposeMessage]
Name=Write new message
Exec=LD_LIBRARY_PATH="$(guix build gpgme)/lib" icedove -compose
```

Source: Kind soul on [Guix mailing list](https://mail.gnu.org/archive/html/bug-guix/2022-05/msg00027.html)

