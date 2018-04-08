---
title: "Manually update app after 'Deploy to Heroku' on Github"
layout: post
date: 2017-10-23 00:00:00 +0200
category:
  - dev
tags:
  - development
  - heroku
  - github
  - git
---

## Instructions

#### 1) Login to Heroku

Before you can login to Heroku, you need to install the heroku-cli interface: [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

`heroku login`

#### 2) Open your project, initiate git repository

Our initial deployment was done using the Github 'Deploy to Heroku' button. To update the application, we need to create a local git repository, ...

`cd my-project/`
<br>`git init`

#### 3) Add Heroku / Github repository as remote / origin

... and add the Heroku and Github repository as remote / origin. It is important that you replace `my-project` with your Heroku remote and `/user/my-project` with the Github source code repository url.

`heroku git:remote -a my-project`
<br>`git remote add origin https://github.com/user/my-project`

#### 4) Commit changes and push to Heroku

Now we just need to pull the latest version from Github, commit all changes and push everything to Heroku. If all goes well, your app will now build and run.

`git pull origin master`
<br>`git add .`
<br>`git commit -am "pre-heroku"`
<br>`git push heroku master`

That's it! Cheers.
