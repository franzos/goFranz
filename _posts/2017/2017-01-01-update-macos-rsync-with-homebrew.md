---
title: "Update MacOS Sierra rsync with Homebrew"
summary: "macOS Sierra ships with 10-year-old rsync software from 2006, but you can easily update it yourself using Homebrew."
layout: post
version: macOS 10.12.2 Sierra
os:
  - macOS
source: https://stackoverflow.com/questions/30842005/upgrading-rsync-on-os-x-using-homebrew
date: 2017-01-01 00:00:00 +0200
category:
  - dev
tags:
  - development
  - macOS
---

Here's a joke: Apple ships 10 year old software with macOS.

Unfortunately it's neither a joke nor it's funny... macOS Sierra, released in September 2016, came with rsync 2.6.9 Version 29, released in November 2006. That's close to 10 years! **Why?**.

Fortunately it's easy to update it yourself:

### 1) IF you have Homebrew installed:

`brew tap homebrew/dupes`
<br>`brew install rsync`

### 2) ELSEIF you have no idea what Homebrew is:

[Homebrew](http://brew.sh/) is sort of like a command line software manager for macOS. To install Homebrew, just copy paste this into your Terminal:

`/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`

Once you're done with this, go back to 1).

### 3) ELSEIF you want to know more:

Here's what's happening:
<br>`brew tap homebrew/dupes`
<br>`brew` calls Homebrew
<br>`tab` instructs Homebrew to add a new package source
<br>`homebrew/dupes` that's the new source
<br>
<br>`brew install rsync`
<br>`install` instructs Homebrew to install a new package
<br>`rsync` that's the package - rsync

You can install other packages `brew install wget`, update installed packages `brew update wget` and even create your own packages. Check out [brew.sh](http://brew.sh/)

### 4) IFELSE

Check out two more macOS package managers:
- [MacPorts](https://www.macports.org/)
- [Fink](http://www.finkproject.org/)
