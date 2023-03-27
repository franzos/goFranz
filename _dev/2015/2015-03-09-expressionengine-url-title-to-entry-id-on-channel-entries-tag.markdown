---
layout: post
title:  "ExpressionEngine URL title to Entry ID on Channel Entries tag"
date:   2015-03-09 08:00:00
summary: "Display a channel entry based on the url title."
categories: ExpressionEngine
category:
  - dev
tags:
  - development
  - database
  - cms
version: 2.9.1
packages: ExpressionEngine
source: https://stackoverflow.com/questions/16350344/url-title-to-entry-id-on-channel-entries-tag
sourcetitle: Peter Lewis on Stackoverflow
---

Display a channel entry based on the url title.

    {exp:channel:entries url_title="{last_segment}" dynamic="no" required_entry="yes" limit="1"}
       {title}
       {if no_results}No results...{/if}
    {/exp:channel:entries}

### Parameter

    url_title="{last_segment}"; {segment_1}; {segment_2}

Determines the segment which contains the url_title value.

    dynamic="no"

"The channel display engine sets some parameters dynamically, based on what is in the URL. There are times, however, where you do not want the parameters affected by what the URL contains. To override the dynamic nature of the channel tag, use dynamic="no"."

    required_entry="yes"

"This parameter tells the channel tag that it should expect the URL to contain a valid entry ID or a valid URL title. If an ID is not found in the URL, the tag will not display any data. Normally, the channel tag will show something, even if the URL doesn’t point to a particular entry. "

    limit="1"

The number of entries you'd like to output.

    {if no_results}No results...{/if}

Set a message in case ExpressionEngine does not find any channel entries.

[Wiki01]: https://ellislab.com/expressionengine/user-guide/add-ons/channel/channel_entries.html#dynamic
[Wiki02]: https://ellislab.com/expressionengine/user-guide/add-ons/channel/channel_entries.html#require-entry
