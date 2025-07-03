---
title: "All at once: I made a huge mistake"
summary: "I ventured into developing PantherX OS, a cutting-edge open-source operating system, aiming to tackle the issues found in Windows and MacOS. Throughout the process, I encountered numerous obstacles and gained valuable insights from the experience."
layout: blog
source:
date: 2022-10-01 18:00:00 +0100
category:
  - Linux
  - Tools
tags:
  - syncthing
  - privacy
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

#### Motivation

For the longest time I assumed our small, motivated team could achieve the impossible: Developing a brilliant, new open source distribution that somehow works better than all the rest, and comes with none of the problems that bothered me on Windows and MacOS. However, it turns out this is **not quite as easy** as it might appear initially, particularly **when you’re building on a foundation that itself is still evolving** and where you’re left to do develop many essential tools from scratch.

I’m sure someone could have told me this a long time ago; Maybe I could have found a post on reddit, by another over-worked maintainer of some small open source distribution - but I wouldn’t have listened anyway.

Maybe all the other failed, or discontinued distributions out there, should have been a big warning sign, but they weren’t – and with none of the available operating systems at that time, satisfying my desires entirely – or even just running reliably without intervention and for more than a couple of months – I jumped ahead.

And I loved it … Throw a bunch of problems my way, and I'm in my element, learning everything there’s to know on the way – that’s all the fun.

#### Disconnect

On our journey developing PantherX OS, **we’ve mostly tuned out from what’s happening around us**; We’ve had a goal and I was pretty sure what we’re doing made sense, so we continued to push ahead, ignoring that with every passing day it was growing more apparent that we were never going to achieve all our goals for 1.0, without growing the team 10X.

Our mission had always been - not to re-invent the wheel - but to blend-in, adopting existing projects and improving / filling gaps where we felt necessary. Yet **I started a lot of small fires** – trying to integrate applications that weren’t ready (Trojita supporting multiple accounts), or I was hoping to migrate to Qt (Claws Mail), or stuff we wrote from scratch like contacts and calendar back-end and application or …

... we either set out to do too much by ourselves, or hoped for others to progress - which never materialized.

What ultimately shook me awake, were the past few months working to bring Nheko – a high performance Matrix client - to Android and iOS. A massive effort, not only due to our lack of experience with Qt-mobile development, but also **unexpected bugs in Qt on Android and compilation issues with Gstreamer**.

While we’ve achieved our goal of porting Nheko to mobile, and integrating it with our accounts management on PantherX and Central Management, work on other issues stopped completely.

---

#### Reconsider

Most of what I’ve set out to achieve still resonates today and fundamentally, nothing has changed. There’s new MacOS, iOS, Android and Windows releases; probably 50 new Linux distribution based on Debian or Arch – and technically, exactly the same problems:

- System configuration is still "JBF" – just a bunch of files
- Even though our goals are identical (ex. Run Mastodon server), **configuration is not standardized**, is hard to replicate, and it’s virtually impossible for someone who provides a tutorial, to push “fixes” to users that consume the tutorial. A massive waste of time.
- Working with deployment tools, that „massage“ the system until it works
- Most users have **virtually no privacy**, with Apple famously uploading and scanning their pictures
- Most systems still **cannot recover from a faulty or undesired update** without backup or specialized filesystem
- Devices have become chattier and operating systems heavier, more cluttered, restrictive and annoying

I don’t have any numbers on how much time is lost each year by individuals on setting up, and maintaining everything from desktop PC’s to server applications. How much times goes into configuration migration and troubleshooting what’s supposed to be an identical setup. How many important changes were never applied to the odd server or PC.

The Arch Linux Wiki is a stunning showcase of how flexible and „open“ Linux is – yet most users struggle to configure their system, or simply don’t care and always want the latest “best”, without having to mess around. I guess they end up on MacOS.

From my point of view, all of this work could be avoided; **Anybody capable of using word, should be able to setup and maintain a secure server** (let alone desktop) - may it be a personal Mastodon instance, a community forum, a VPN to escape government censorship, or an application that powers the success of your company.

Why do people in 2022 still have to search for the „right“ setup guide, to get nginx running; another to get a SSL certificate on their specific distribution, and yet another to install and configure the server application – not to mention learning how-to keep it all secure – and somehow keeping track of where these config files are – and then, learning how-to migrate them, when things change.

Do we really have nothing better to do?<br>
Maybe we enjoy setting up nginx for the ten-billion’th time.<br>
Maybe we have some deployment automation that we enjoy fixing every year?<br>
Or it’s our job, to do it for someone else? -- Okay; I won’t argue with you<br>
… but it seems, even Twitter doesn’t have this under control.

My point is: There’s a solution. It’s called guix (and nix – to be fair).

Whereas you had to previously move around and update configuration files manually, guix enables us to move this entire setup into a central repository, from where you can apply modifications seamlessly and with inheritance. Changes reach endpoints with the next automatic update, and a faulty release (or configuration) takes about half a second to revert.

Now, that’s just you, your own little lab, or company…

Think about what happens, when we beam this perfectly configured desktop (PantherX Desktop) or server application (Mastodon, Gitea, Gitlab, …) to millions of users across the world. If we have to replace xorg with wayland, or nginx with ? tomorrow, **we adapt one file – and millions benefit without even thinking about it**. No Docker; no Ansible or Salt or Chef or …

#### Reflection

None of our efforts have been in vain, and I certainly learned my lesson...

... met a bunch of cool people, and developed an initial set of applications including our online accounts framework, Software management, Settings, Hub, Installer and a number of enterprise applications for device registration, monitoring and backup.

PantherX OS also (finally!) runs on Raspberry Pi (+ many other ARM boards).

#### Next steps

It’s time to take what we have, and integrate it into a viable and complete Desktop environment taking into account our current constrains (we’re not going to have my dream mail client ready tomorrow) that remains lightweight, but meets the needs of our users. I’m satisfied if we can provide a reliable, 100% GUI-driven release in the coming 3 months and grow our community along the road.

I welcome everyone - executives, programmers, artists, gamers, aliens; whoever you are - to join us, to realize these and many future goals at [pantherx.org](www.pantherx.org).
