---
title: "ExpressionEngine and MySQL 5.7: this is incompatible with DISTINCT"
layout: post
version: 2.9.2
os:
  - macOS
  - Linux
source:
date: 2017-01-01 00:00:00 +0200
category:
  - dev
tags:
  - 'expression engine'
  - mysql
---

If you've just tried running ExpressionEngine 2.9.2+ on MYSQL 5.7... This is what happened:

`Error Number: 3065
Expression #1 of ORDER BY clause is not in SELECT list, references column 'mgs.t.sticky' which is not in SELECT list; this is incompatible with DISTINCT
SELECT DISTINCT(t.entry_id) FROM exp_channel_titles AS t LEFT JOIN exp_channels ON t.channel_id = exp_channels.channel_id LEFT JOIN exp_members AS m ON m.member_id = t.author_id INNER JOIN exp_category_posts ON t.entry_id = exp_category_posts.entry_id INNER JOIN exp_categories ON exp_category_posts.cat_id = exp_categories.cat_id WHERE t.entry_id !='' AND t.site_id IN ('1') AND t.entry_date < 1485361752 AND (t.expiration_date = 0 OR t.expiration_date > 1485361752) AND t.channel_id IN (10) AND exp_categories.cat_id = '66' AND t.status = 'open' ORDER BY t.sticky desc, t.title asc, t.entry_id asc LIMIT 0, 20
Filename: modules/channel/mod.channel.php
Line Number: 2160`

The reason you're seeing this is, that a number of older apps are not compatible with strict SQL mode introduced in MYSQL 5.7. Fortunately there's something you can do about this:

__Option 1__: EllisLab has long fixed this. Simply download the latest version of ExpressionEngine and update everything. Just make sure that the plugins you're running are still compatible.

__Option 2__: You can simply disable strict SQL mode! There's a great guide on the DigitalOcean Community: [How To Prepare For Your MySQL 5.7 Upgrade](https://www.digitalocean.com/community/tutorials/how-to-prepare-for-your-mysql-5-7-upgrade). If you're on Serverpilot, check out [this](https://serverpilot.io/community/articles/how-to-disable-strict-mode-in-mysql-5-7.html) guide.
