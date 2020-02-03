---
title: Create a Blog With Github Pages and Gatsby
date: "2020-02-02T22:49:51Z"
description: "I just setup a blog using Gatsby.js that publishes on push using github actions to github pages."
---

I'm putting down the steps I took to set this thing up before I forget.

## Install and run Gatsby init

Recently, I decided to give this whole go directory structure a try, so I made a dir for my personal stuff:

```bash
mkdir -p github.com/quinn
cd !$
```

Next, I used the Gatsby Starter Blog found [here](https://www.gatsbyjs.org/starters/gatsbyjs/gatsby-starter-blog/). To create a new Gatsby project using the template, run this command:

```bash
gatsby new gatsby-starter-blog https://github.com/gatsbyjs/gatsby-starter-blog
```