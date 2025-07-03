---
layout: blog
title:  "Wordpress MYSQL import fails with Unknown collation: 'utf8mb4_unicode_ci'"
date:   2015-04-19 08:00:00
summary: "MYSQL import fails with ERROR: Unknown collation: 'utf8mb4_unicode_ci'"
categories: PHP, Wordpress
category:
  - dev
tags:
  - development
  - database
  - mysql
  - troubleshooting
version: 4.2.2
packages: PHP
source:
sourcetitle:
---

If your MYSQL database import fails with **Unknown collation: 'utf8mb4_unicode_ci'** after the latest Wordpress update 4.2.2, chances are that you are running a MYSQL server version 5.5.2 or below. With the most recent update, Wordpress changed their encoding standard from **utf8** to **utf8mb4**, which is only supported starting with MYSQL server version 5.5.3 which was released in 2010.

We strongly advise that you update your MYSQL server to version 5.5.3 or higher. If for any reason you are unable to do so, you can export your MYSQL database in a legacy format:

1. Open PHPMYADMIN on your local development server
2. Open your Wordpress database
3. Go to 'Export' and select the 'Custom' export method
4. Look for 'Database system or older MySQL server to maximize output compatibility with:' and select **MYSQL40**
5. Export the database as usual

![Export MYSQL Database in legacy format]({{ site.dev_img }}utf8mb4_unicode_ci.png)

You can now import the database on your old MYSQL server. We've tested this on a client's MYSQL server running at version 5.1.73.
