---
published: true
layout: post
title: Docker Tips and Tricks
date: "2014-09-07"
description: |

  Here are a few little things I use on a daily basis while working with docker.

topic: devops
---

### Enter a container

To do this you'll need a tool called `nsenter`. The easiest way to get it is
to use the docker based installer: https://github.com/jpetazzo/nsenter One you
have this you can enter a running instance or run a command on a running
instance:

~~~ bash
sudo nsenter \
  --target `docker inspect --format '{{.State.Pid}}' postgres` \
  --mount --uts --ipc --net --pid /bin/bash
~~~

If you used the above installer you'll also have a shortcut for this:

~~~ bash
docker-enter postgres
~~~

### Inspect API traffic

you can use `socat` to monitor traffic to the docker socket to introspect on
API usage:

~~~ bash
sudo socat -t100 -v \
  UNIX-LISTEN:/tmp/proxysocket.sock,mode=777,reuseaddr,fork \
  UNIX-CONNECT:/var/run/docker.sock
~~~

Leave this open and open a new terminal. Specify the socket created by socat
as the docker host:

~~~ bash
DOCKER_HOST=unix:///tmp/proxysocket.sock docker ps
~~~

As the command runs observe the output from the previous terminal. This can be
very helpful when developing against the docker API to see how the terminal
commands operate.

### Batch commands

Sometimes it can be quicker to operate on multiple docker containers at once,
especially while testing a new container to get the parameters correct.

Remove all containers of a given image:

~~~ bash
docker rm `docker ps -a | grep 0fa4de | cut -f1 -d" "`
# also this format uses xargs instead of backticks
docker ps -a | grep 0fa4de | cut -d ' ' -f 1 | xargs docker rm
# or if you need to stop them before removing replace rm with kill:
docker ps -a | grep 0fa4de | cut -d ' ' -f 1 | xargs docker kill
docker ps -a | grep 0fa4de | cut -d ' ' -f 1 | xargs docker rm
~~~

Remove stopped containers:

~~~ bash
docker ps -a | grep Exit | cut -d ' ' -f 1 | xargs docker rm
~~~~

You can use similar techniques for deleting images (though removing multiple
images is less common):

~~~ bash
docker ps -a | grep string-of-text | cut -d ' ' -f 1 | xargs docker rmi
~~~

Hopefully this helps! Let me know if you have any other common techniques
while using docker.

