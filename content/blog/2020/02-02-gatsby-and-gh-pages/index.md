---
title: Create a Blog With Github Pages and Gatsby
date: "2020-02-02T22:49:51Z"
description: "Setup a blog using Gatsby.js that publishes on push using github actions to github pages"
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
gatsby new $blog_folder_name_goes_here \
  https://github.com/gatsbyjs/gatsby-starter-blog
```

Ok great, that probably worked. I then made a few customizations to the template but thats not really interesting nor relevant to this blog post. You can build your blog by running `yarn build`, this will use webpack to compile the blog's content into the `public` directory in the project folder.

## Deploy to Github Pages

In order to get this generated content onto github, you'll need a repo, I created mine as open source at [github.com/quinn/blog](https://github.com/quinn/blog). From here, you can use the [gh-pages](https://github.com/tschaub/gh-pages) tool to deploy to Github Pages for the repository you created, as described in [this tutorial on the Gatsby website](https://www.gatsbyjs.org/docs/how-gatsby-works-with-github-pages/). While this works fine, I thought I'd see if I could get it to work with Github's actions tool.

## Setting up the Github Action

Here is my yaml file, in Literate Programming style:


```yaml
name: Publish
on: [push]
jobs:
  build:
    name: Publish
    runs-on: ubuntu-latest
    steps:
```

The first step is to "checkout" your repisitory. Most github actions start in this way.

```yaml
    - name: Checkout
      uses: actions/checkout@v1
```

Since we are creating the build on github's CI, it'll need all of the (production) packages:

```yaml
    - name: Install NPM Packages
      uses: borales/actions-yarn@v2.0.0
      with:
        cmd: install --production
```

Next we create the build. To enable Google Analytics, I've added the `GA_TRACKING_ID` env var and secret, and updated the `gatsby-config.js` to read from this env var. This doesn't _really_ need to be secret, but seemed cleaner this way.

```yaml
    - name: Static Build
      uses: borales/actions-yarn@v2.0.0
      with:
        cmd: build
      env:
        GA_TRACKING_ID: ${{ secrets.GA_TRACKING_ID }}
        NODE_ENV: production
```

I'm using a custom hostname, so I needed to ensure that the `CNAME` file is present. Since the gh-pages uploader tool replaces everything in the `gh-pages` branch, this file needs to be created. And it needs to be created with `sudo` for some reason. I was getting a Permission Denied without it. Shrug.

```yaml
    - name: Set CNAME
      run: |
        sudo tee -a public/CNAME > /dev/null << EOF
        quinnshanahan.com
        EOF
```

The last step is to actually upload the contents of the `public` folder to the root of the `gh-pages` branch. I tried a different ways to do this on Github CI and this one was definitely the easiest. To work, you need to have a deploy key pair added to your repo with write access. The [README](https://github.com/peaceiris/actions-gh-pages#getting-started) for the action has all the information you'll need on how to set this up.

```yaml
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v2
      env:
        ACTIONS_DEPLOY_KEY: ${{ secrets.ACTIONS_DEPLOY_KEY }}
        PUBLISH_BRANCH: gh-pages
        PUBLISH_DIR: ./public
```

And that should do it! You can see this _in action_ (lol) for my blog here: https://github.com/quinn/blog/actions. Neat!