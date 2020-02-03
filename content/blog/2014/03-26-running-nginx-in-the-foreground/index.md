---
layout: post
title: Running NGINX in the Foreground
date: "2014-03-26"
description: |
  If you're planning on using nginx as a frontend to one or more app processes, it can be helpful to setup and test things locally. An easy way to do this is to run nginx in the foreground so you can quickly iterate your config options to see what works.
topic: devops
---

If you're planning on using nginx as a frontend to one or more app processes,
it can be helpful to setup and test things locally. An easy way to do this is
to run nginx in the foreground so you can quickly iterate your config options
to see what works. First, you need to create a config:

~~~ nginx
# nginx.conf
# put wherever you want, mine is in the base of my project directory

worker_processes  1;
daemon off;

events {
  worker_connections 1024;
}

http {
  server {
    listen 8080;
  }
}

~~~

the most important line is `daemon off` which will cause nginx to run in the
foreground. This will still run with the typical master / worker setup though,
and can be used in production.

The rest is the most minimal boilerplate to get nginx to serve an http server
on port 8080.

Try opening browsing to [http://localhost:8080/](http://localhost:8080/). You
should see a successful installation message from nginx. From here you can
setup proxies to your apps or whatever other config you want to test out.
