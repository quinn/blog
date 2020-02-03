---
title: Switching wordpress to nginx
date: "2010-08-23T08:30:35Z"
---

I just updated my server to use nginx from apache/mod_php because loading wordpress on my tiny slicehost slice was tanking the poor thing. Apache was spawning processes like crazy and pages were taking forever to load, even when I am the only person viewing the site. My new setup uses php-cgi based on this tutorial:

http://tomasz.sterna.tv/2009/04/php-fastcgi-with-nginx-on-ubuntu/

this is what my nginx config looks like:

```
server {
  listen          80;
  server_name     blog.quinnshanahan.com;

  access_log      /var/log/nginx/blog.quinnshanahan.com.access_log;
  error_log       /var/log/nginx/blog.quinnshanahan.com.error_log warn;

  root            /var/www/blog.quinnshanahan.com;

  index           index.php index.html;
  fastcgi_index   index.php;

  location / {
    # this sends all non-existing file or directory requests to index.php
    if (!-e $request_filename) {
      rewrite ^(.+)$ /index.php?q=$1 last;
    }
  }

  location ~ \.php {
    include /etc/nginx/fastcgi_params;
    keepalive_timeout 0;
    fastcgi_param   SCRIPT_FILENAME  $document_root$fastcgi_script_name;
    fastcgi_pass    127.0.0.1:9000;
  }
}
```

highly recommended.. its amazing how much faster it is!
