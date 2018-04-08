---
layout: post
title:  "Retrieve a domain's favicon with Google S2"
date:   2015-03-18 08:00:00
excerpt: "It's easy and free to retrieve a favicon with Google S2"
categories: HTTP, HTML
category:
  - dev
  - frontend
tags:
  - development
version: 2.9.1
packages: HTTP, HTML
source:
sourcetitle:
---

Here's what you need to do:

```http://www.google.com/s2/favicons?domain=yourdomain.com
https://www.google.com/s2/favicons?domain=yourdomain.com
#replace yourdomain.com
```

This is how you use it:

```<img src="https://www.google.com/s2/favicons?domain=dkkma.com" alt="DKKMA Agency">
```

Finally, this is how it looks like: <img src="https://www.google.com/s2/favicons?domain=dkkma.com" alt="DKKMA Agency">
