---
title: "Backup and decrypt WhatsApp Android"
summary: How to create a backup of WhatsApp, that you can decrypt and open on your computer, without rooting Android.
layout: blog
source:
date: 2024-01-09 0:00:00 +0000
category:
  - Tools
tags:
  - whatsapp
  - android
  - linux
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I tested this on Android 8.1 with WhatsApp `v2.23.25.83`.
The document was written for/on guix.

This will only work if you either, (a) have not already setup an end-to-end encrypted backup, or (b) have setup encrypted backup without password, and still have the key.

### Backup

1. Open WhatsApp, Settings, Chat Backup and enable end-to-end encrypted backup, but do not use a password (write down the key!)
2. Wait till the new, encrypted backup is complete, then plugin your phone via USB
3. Make sure you've got USB debugging enabled
4. Use adb to copy WhatsApp data from your phone, to your PC

```bash
adb pull /storage/emulated/0/Whatsapp
```

This includes messages, images, videos and so on. Let's decrypt the database:

### Decrypt

Install required system dependencies, then install the python package via pip:

```bash
guix shell python electrum
python3 -m venv venv
source venv/bin/activate
pip3 install wa-crypt-tools
```

Our folder looks like this now:

```bash
$ ls
venv/  Whatsapp/
```

Now simply decrypt the latest version of the database; make sure to use your own key instead of `e24c...`:

```bash
decrypt14_15 e24c40a4026ec124e12a2f6b34b216a02ac90d700b2c4f1133e20580c06a1c4f ./Whatsapp/Databases/msgstore.db.crypt15
```

If that worked, you should find `msgstore.db` in your current directory:

```bash
$ ls
msgstore.db  venv/  Whatsapp/
```

This is a standard sqlite database, so it's easy to explore.

If you also want to export your WhatsApp contacts, you can repeat the above step for `Backups/wa.db.crypt15`; This only works if you have any contacts in WhatsApp (as in, you've given WhatsApp access to your contacts).

```bash
decrypt14_15 e24c40a4026ec124e12a2f6b34b216a02ac90d700b2c4f1133e20580c06a1c4f ./Whatsapp/Backups/wa.db.crypt15 ./wa.db
```

### Format

You can also export this in a more usable format; Continue in the existing environment:

```bash
git clone https://github.com/chrrel/whatsapp-exporter.git
cd whatsapp-exporter/whatsapp-exporter
vim config.cfg
```

You'll have to adapt this file, to fit your environment:

```
[input]
# Path to the file msgstore.db
msgstore_path=../../msgstore.db
# Use external contacts database wa.db?
use_wa_db = True
# Path to the file wa.db
wa_path=../../wa.db

[output]
# Create an HTML export?
export_html=True
# Path to the HTML file to export
html_output_path=../../output/index.html
# Create an export to txt files?
export_txt=False
# Path to the directory for exporting txt files
txt_output_directory_path=../../output
```

Then run `main.py`:

```bash
$ python3 main.py 
### WhatsApp Database Exporter ###
[+] Reading Database
[+] Using table 'message'
Traceback (most recent call last):
  File "/tmp/franz/whatsapp-export/whatsapp-exporter/whatsapp-exporter/main.py", line 128, in <module>
    main()
  File "/tmp/franz/whatsapp-export/whatsapp-exporter/whatsapp-exporter/main.py", line 116, in main
    chats = query_all_chats(config["input"].get("msgstore_path"), contacts)
  File "/tmp/franz/whatsapp-export/whatsapp-exporter/whatsapp-exporter/main.py", line 83, in query_all_chats
    messages = query_messages_from_table_message(con, key_remote_jid, contacts)
  File "/tmp/franz/whatsapp-export/whatsapp-exporter/whatsapp-exporter/main.py", line 61, in query_messages_from_table_message
    for timestamp, remote_jid, from_me, data, message_type, latitude, longitude, media_path in cur.execute(query, {"key_remote_jid": key_remote_jid}):
sqlite3.OperationalError: Could not decode to UTF-8 column 'text' with text '�������'
```

Unfortunately this didn't work for me, probably due to some special characters in my message history; I filed an issue [here](https://github.com/chrrel/whatsapp-exporter/issues/18) and will get back to this, once I have some more time.

## Restore

I haven't tried this for a while, but as long as you keep a copy of your encrypted backup, you should be able to restore this on another Android phone; Checkout this guide: [How to restore chats from your phone's WhatsApp database](https://faq.whatsapp.com/6181521285295518/?cms_platform=android).

## Thanks

Much thanks goes to the developers of [wa-crypt-tools](https://github.com/ElDavoo/wa-crypt-tools). If this worked for you, and you have a GitHub account, maybe give them a star, as thanks? :)



