---
layout: post
title: Log to STDOUT and STDERR when Running NGINX in the Foreground
date: "2014-04-19"
description: |
  I'm wrapping NGINX in a small go script to capture the output of the log files and pass them to STDOUT and STDERR. This is somewhat of a follow-up on my original post about running NGINX in the foreground.

topic: devops
---

This is somewhat of a follow-up to this post:

http://tastehoneyco.com/blog/running-nginx-in-the-foreground/

The instructions there are simple enough and it works great, but no output is
logged while NGINX is running. This can be annoying if you like treating logs
as streams rather than as something that ends up in a file on a (probably
transient) filesystem. Unfortunately there doesn't seem to be a way to do this
through the NGINX config, probably because it doesn't fit with the typical
NGINX paradigm (a service running in the background with master / worker
processes). However, I want to do it anyway. I created a simple go script to
handle this:

~~~ go
package main

import (
    "fmt"
    "os/exec"
    "os"
    "github.com/ActiveState/tail"
)

func Nginx(c chan int) {
  pwd, _ := os.Getwd()
  conf   := pwd + "/nginx.conf"
  cmd := exec.Command("nginx", "-c", conf)
  cmd.Stdout = os.Stdout
  cmd.Stderr = os.Stderr
  cmd.Run()
}

func AcessLog(c chan int) {
  t, _ := tail.TailFile("/path/to/nginx/logs/nginx-access.log", tail.Config{Follow: true})

  for line := range t.Lines {
    fmt.Println(line.Text)
  }
}

func ErrorLog(c chan int) {
  t, _ := tail.TailFile("/path/to/nginx/logs/nginx-error.log", tail.Config{Follow: true})

  for line := range t.Lines {
    fmt.Fprintln(os.Stderr, line.Text)
  }
}

func main() {
    c := make(chan int)
    go Nginx(c)
    go AcessLog(c)
    go ErrorLog(c)

    nginx  := <- c
    access := <- c
    error  := <- c

    fmt.Println(nginx)
    fmt.Println(access)
    fmt.Println(error)
    fmt.Println("done.")
}
~~~

All this is doing is setting up 3 goroutines, 1 for the nginx master process,
1 for a tail of the error log which gets printed to STDERR, and 1 for the
access log which gets printed to STDOUT. This requires some additional config
in the NGINX config:

~~~ nginx
worker_processes  1;
daemon off;

events {
  worker_connections 1024;
}

http {
  access_log /path/to/nginx/logs/nginx-access.log;
  error_log  /path/to/nginx/logs/nginx-error.log debug;

  server {
    listen 8080;
  }
}
~~~

As you can see I've increased the log level to `debug` to get the maximum
amount of information from NGINX. That's it! Try running the go script, and
you should see requests and errors showing up in the terminal as they are
made.
