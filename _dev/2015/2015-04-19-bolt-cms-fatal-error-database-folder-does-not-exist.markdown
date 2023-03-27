---
layout: post
title:  "Bolt - Fatal Error: The database folder does not exist."
date:   2015-04-19 08:00:00
summary: "The database folder does not exist.  Make sure it's present and writable to the user that the webserver is using."
categories: PHP, "Bolt CMS"
category:
  - dev
tags:
  - development
  - database
  - cms
  - troubleshooting
version: 2.1.4
packages: PHP, Twig
source:
sourcetitle:
---

    Bolt - Fatal Error
    The database folder /path/to/database does not exist. Make sure it's present and writable to the user that the webserver is using. This is a fatal error. Please fix the error, and refresh the page. Bolt can not run, until this error has been corrected.

If you've ever seen this error, chances are that you moved Bolt CMS either to a new directory or a new server. You may have noticed that the database folder path mentioned in the error message actually points to your old database, even though Bolt is now running under a different path.

The good news is, it takes only 5 seconds to resolve this issue.

1. Open the 'app' folder within the Bolt root folder
2. Look for the 'cache' folder and clear out all contents
3. Reload - Celebrate!
