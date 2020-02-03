---
layout: post
title: Experiments with Docker
date: "2014-04-04"
description: |
 Docker is a wonderfully fun tool that makes building things like a PaaS almost trivial. I've documented a brief intro to some of Docker's common cli functions

topic: devops
---

Docker is a wonderfully fun tool that makes building something like a PaaS
almost trivial. Docker has great tutorials and documentation on their main
website: https://www.docker.io/

Docker builds on top of LXC (LinuX Containers) to provide a clean, easy-to-use
interface for setting up and running containers. Because of this, Docker will
only run on a linux distribution.

The first thing to do is to take a look at the help menu for the `docker`
command:

~~~
Usage: docker [OPTIONS] COMMAND [arg...]
 -H=[unix:///var/run/docker.sock]: tcp://host:port to bind/connect to or unix://path/to/socket to use

A self-sufficient runtime for linux containers.

Commands:
    attach    Attach to a running container
    build     Build a container from a Dockerfile
    commit    Create a new image from a container's changes
    cp        Copy files/folders from the containers filesystem to the host path
    diff      Inspect changes on a container's filesystem
    events    Get real time events from the server
    export    Stream the contents of a container as a tar archive
    history   Show the history of an image
    images    List images
    import    Create a new filesystem image from the contents of a tarball
    info      Display system-wide information
    insert    Insert a file in an image
    inspect   Return low-level information on a container
    kill      Kill a running container
    load      Load an image from a tar archive
    login     Register or Login to the docker registry server
    logs      Fetch the logs of a container
    port      Lookup the public-facing port which is NAT-ed to PRIVATE_PORT
    ps        List containers
    pull      Pull an image or a repository from the docker registry server
    push      Push an image or a repository to the docker registry server
    restart   Restart a running container
    rm        Remove one or more containers
    rmi       Remove one or more images
    run       Run a command in a new container
    save      Save an image to a tar archive
    search    Search for an image in the docker index
    start     Start a stopped container
    stop      Stop a running container
    tag       Tag an image into a repository
    top       Lookup the running processes of a container
    version   Show the docker version information
    wait      Block until a container stops, then print its exit code
~~~

This has a wealth of information on what you can do right away with docker.
Try running `docker run ubuntu touch file_in_container` to get an idea about
how things work. This command will download the ubuntu image and create a new
container which runs the command `touch file_in_container`.

it is important to remember that docker container are _stateless_. A
container's contents will always be exactly as they are in the container's
image, and it is not possible to run a command on an existing container
(running `docker run ubuntu touch file_in_container` would create a new
container to run the command). Try running something more substantial:

~~~ bash
docker run ubuntu apt-get -y install build-essential
~~~

If you decided that having build tools installed was a good starting point,
you could save this container's state as an image. Let's find our container by
running `docker ps -a`:

~~~
CONTAINER ID        IMAGE                   COMMAND                CREATED             STATUS
305883092cfd        ubuntu:latest           apt-get -y install b   5 minutes ago       Exit 0
3088358bd9c5        ubuntu:latest           touch file_in_contai   5 minutes ago       Exit 0
~~~

It looks like "305883092cfd" is the one we want. Try saving it:

~~~ bash
docker commit 305 buildtools
~~~

Now run `docker images`:

~~~
REPOSITORY          TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
buildtools          latest              d036e72d2e40        2 minutes ago       320.5 MB
ubuntu              latest              9cd978db300e        10 minutes ago      204.4 MB
~~~

As you can see, you have now prepared for yourself an image with build tools
preinstalled. Try running:

~~~ bash
docker run buildtools make
~~~

As you can see, the `docker` command provides some great high-level tools for
learning about Docker. For anything serious though, you'll probably want to
use the API. I'll be writing a follow-up on that soon. Stay tuned!
