---
title: "Create a todo list using Firebase and Vue.js"
summary: "Tutorial for building a todo list application using Firebase for data storage and Vue.js with Vuefire for the frontend."
layout: blog
date: 2017-10-26 00:00:00 +0200
category:
  - dev
  - frontend
tags:
  - development
  - frontend
  - firebase
  - vue.js
---

## Minimum Requirements

- Firebase project
- [Vue.js](https://vuejs.org/)
- [Vuefire](https://github.com/vuejs/vuefire)
- [Firebase](https://firebase.google.com/docs/web/setup)

## Instructions

### Set-up Firebase access

Set-up access rules under [Firebase](https://console.firebase.google.com/) > Database > Rules. **Note**: These rules give anyone, even people who are not users of your app, read and write access to your database. Do not use this in production.

    {
      "rules": {
        ".read": true,
        ".write": true
      }
    }

#### Live Preview

In this live preview, we are using Firebase to store our tasks, and keep clients in sync. Feel free to open this preview in separate browser windows, and watch to-do list update as you make changes.

<iframe class="live-preview" src="/assets/preview/firebase-todo-list.html"></iframe>

#### Code

<script src="https://gist.github.com/franzos/2cf2a9a40bb6b873b7390c3a99336b4a.js"></script>
