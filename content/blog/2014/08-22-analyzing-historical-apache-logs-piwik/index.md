---
published: true
layout: post
title: Analyzing historical apache log data using piwik
date: "2014-08-22"
description: |
Sometimes tools like google analytics don't provide the insight you need and it can be helpful to go directly to the source: the log files.

topic: application-development
---
There are various tools that provide log anaslysis for apache. Of the ones I was able to find piwik seemed like the best. it seems well maintaned and seemed to support themy specific use case well.

### Installation

The easiest way I found to install piwik was using Docker:

~~~
docker run --name piwik -p=10000:80 -v=/mnt/piwik:/data quinn/piwik
~~~

### Import logs

Get your apache log file from where it is stored. Usually, it is in a
directory such as `/var/log/httpd/access.log` or something similar. Given a
file named access.log, run this:

~~~
docker-enter piwik
./import_logs.py --url=http://docker-002.tastehoneyco.com/ access.log --idsite=1 --recorders=2 --enable-http-errors --enable-http-redirects --enable-static --enable-bots
~~~

Now reindex the data:

~~~
./console core:archive --force-all-websites --force-all-periods=315576000 --force-date-last-n=1000 --url=http://docker-002.tastehoneyco.com:10000/
~~~

Now navigate to the visits tab within the piwik interface and you should see
all of the apache request logs.  Piwik provides great filtering and sorting
functionality to help you find any unusual traffic. Next, you may want to
emulate some nefarious traffic of your own. [Read our install guide for
metasploit](/blog/installing-metasploit-on-osx-with-rbenv), a tool for finding
and testing vulnurabilities in your infrastructure.
