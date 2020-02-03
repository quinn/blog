---
published: true
layout: post
title: Preventing brute-force attacks on Wordpress's wp-login.php
date: "2014-08-30"
description: |
Even if you use a non-standard username and strong password it can still be a burden on your server getting hit with the occasional brute-force attack to Wordpress's login page. Here you can use ModSecurity to limit the number requests and save resources.

topic: information-security
---

The solution here uses [ModSecurity][modsec] and is based mostly on [this
article by Todd Garrison][article]. There are many ways that one could handle
this issue, for example a plugin in wordpress, an upstream proxy server that
handles security, or a modifacation to the web server (in this case apache). I
chose to handle this on the webserver in part because there were many well
documented solutions for this and that it seemed like the best way to conserve
system resources (by not adding bloat to wordpress) without adding too much
infrastructure.

### Installation

The first thing you'll need to do is install ModSecurity which will probably
be available in your package manager (I'm using yum / RHEL in this example):

~~~ bash
sudo yum install mod_security
~~~

This will most likely create some config files for you within your apache root
directory (e.g. `/etc/httpd`). These settings will enable ModSecurity as well
as setup logging and some sensible defaults. These are in `mod_security.conf`.
You may want to check the default settings for uploads in case they will
affect your users.

### Configure for /wp-login.php

Borrowing (heavily) from the config provided [here][article], create a config
for wordpress and place in the ModSecurity config directory:

~~~ bash
# /etc/httpd/modsecurity.d/wordpress.conf

# This has to be global, cannot exist within a directory or location clause . . .
SecAction phase:1,log,pass,initcol:ip=%{REMOTE_ADDR},initcol:user=%{REMOTE_ADDR},id:1

<Location /wp-login.php>
    # Setup brute force detection.

    # React if block flag has been set.
    SecRule user:bf_block "@gt 0" "deny,status:401,log,msg:'ip address blocked for 5 minutes, more than 15 login attempts in 3 minutes.',id:2"

    # Setup Tracking.  On a successful login, a 302 redirect is performed, a 200 indicates login failed.
    SecRule RESPONSE_STATUS "^302" "phase:5,t:none,log,pass,setvar:ip.bf_counter=0,id:3"
    SecRule RESPONSE_STATUS "^200" "phase:5,chain,t:none,log,pass,setvar:ip.bf_counter=+1,deprecatevar:ip.bf_counter=1/180,id:4"
    SecRule ip:bf_counter "@gt 15" "t:none,setvar:user.bf_block=1,expirevar:user.bf_block=300,setvar:ip.bf_counter=0"
</location>
~~~

It is almost identical to the example provided in the link save a few changes
possibly due to version differences. For example, the id parameter has been
added to all of the rules except the last one.

Once you're ready, reload the apache config:

~~~ bash
sudo /etc/init.d/httpd reload
~~~

### Explanation

The ModSecurity syntax can be a bit cryptic, so I'll try to break it down as
best I can. The first assumption is that a 302 response on wp-login.php means
a successful login and a 200 means a failed one. Each time a request is made
(that returns with a 200 status code) it increments a counter for the ip
address by one `setvar:ip.bf_counter=+1` and then checks to see if the counter
is over 15 `SecRule ip:bf_counter "@gt 15"`. If it is, it says a variable to
block the user that expires in 300 seconds (5 minutes)
`setvar:user.bf_block=1,expirevar:user.bf_block=300` and resets the counter on
the IP address `setvar:ip.bf_counter=0`. As long as the blocking variable is
set the user will be denied access `SecRule user:bf_block "@gt 0"
"deny,status:401"`.

While all of this is happening the ip address counter is being decremented by
1 every 180 seconds (3 minutes) `deprecatevar:ip.bf_counter=1/180`. This means
that as long as the user waits at least 3 minutes in between each request they
will never get denied access for 5 minutes.

### Testing

The easiest way to test this is to just hit the login screen a bunch with
incorrect credentials. You should see a screen telling you that you are denied
access pretty quickly.

I hope this helps with how to deal with this common brute-force attack and
also how ModSecurity works.

[modsec]: https://www.modsecurity.org/
[article]: http://www.frameloss.org/2011/07/29/stopping-brute-force-logins-against-wordpress/
