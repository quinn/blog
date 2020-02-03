---
published: true
layout: post
title: Installing Metasploit on OS X with rbenv
date: "2014-08-17"
description: |
Setting up metasploit from scratch can be a bit convoluted, here are steps I took to get it set up on OS X.

topic: information-security
---

For some recent work I've had to identify and fix some Denial of Service /
brute force attacks for one of our clients. A great open-source tool for this
is called [Metasploit](https://github.com/rapid7/metasploit-framework).

They provide an installer (sign-up required), but for this type of thing I
prefer to just install it myself.

First things first, you need to have ruby and homebrew installed.

The first step is to clone the repository:

~~~ sh
mkdir -p /usr/local/src
cd /usr/local/src
git clone https://github.com/rapid7/metasploit-framework.git
~~~

Next, you have to have ruby 1.9.3 installed. For this you will need
[rbenv](https://github.com/sstephenson/rbenv).

~~~ sh
rbenv install 1.9.3-p547
~~~

If rbenv tells you this version is not available make sure ruby-build is up-
to-date.

You'll now need to create your `database.yml`. To do this, copy the example
file and modify it to fit your needs:

~~~ sh
cp config/database.yml.example config/database.yml
subl config/database.yml
~~~

In this example I have `subl` to edit in Sublime Text, use whatever text
editor you are comfortable with.

Now we have to install metasploit's dependencies and database:

~~~ sh
gem install bundler
bundle install
rake db:create
~~~

Create the `msf` command:

~~~ sh
cat << EOF > /usr/local/bin/msf
#!/usr/bin/env bash
exec /usr/local/src/metasploit-framework/msfconsole \
  -y /usr/local/src/metasploit-framework/config/database.yml \
  -e development \$*
EOF
chmod +x /usr/local/bin/msf
~~~

The first time you run `msf` you may want to rebuild the cache for faster searching:

~~~ sh
msf -x db_rebuild_cache
~~~

Try to search for an exploit to test it out:

~~~
msf > search wordpress

Matching Modules
================

   Name                                                      Disclosure Date  Rank       Description
   ----                                                      ---------------  ----       -----------
   auxiliary/gather/wp_w3_total_cache_hash_extract                            normal     W3-Total-Cache Wordpress-plugin 0.9.2.4 (or before) Username and Hash Extract
   auxiliary/scanner/http/wordpress_login_enum                                normal     Wordpress Brute Force and User Enumeration Utility
   auxiliary/scanner/http/wordpress_pingback_access                           normal     Wordpress Pingback Locator
   auxiliary/scanner/http/wordpress_scanner                                   normal     Wordpress Scanner
   exploit/unix/webapp/php_wordpress_foxypress               2012-06-05       excellent  WordPress Plugin Foxypress uploadify.php Arbitrary Code Execution
   exploit/unix/webapp/php_wordpress_lastpost                2005-08-09       excellent  WordPress cache_lastpostdate Arbitrary Code Execution
   exploit/unix/webapp/php_wordpress_optimizepress           2013-11-29       normal     WordPress OptimizePress Theme File Upload Vulnerability
   exploit/unix/webapp/php_wordpress_total_cache             2013-04-17       excellent  Wordpress W3 Total Cache PHP Code Execution
   exploit/unix/webapp/php_xmlrpc_eval                       2005-06-29       excellent  PHP XML-RPC Arbitrary Code Execution
   exploit/unix/webapp/wp_advanced_custom_fields_exec        2012-11-14       excellent  WordPress Plugin Advanced Custom Fields Remote File Inclusion
   exploit/unix/webapp/wp_asset_manager_upload_exec          2012-05-26       excellent  WordPress Asset-Manager PHP File Upload Vulnerability
   exploit/unix/webapp/wp_google_document_embedder_exec      2013-01-03       normal     WordPress Plugin Google Document Embedder Arbitrary File Disclosure
   exploit/unix/webapp/wp_property_upload_exec               2012-03-26       excellent  WordPress WP-Property PHP File Upload Vulnerability
   exploit/unix/webapp/wp_wptouch_file_upload                2014-07-14       excellent  Wordpress WPTouch Authenticated File Upload
   exploit/unix/webapp/wp_wysija_newsletters_upload          2014-07-01       excellent  Wordpress MailPoet Newsletters (wysija-newsletters) Unauthenticated File Upload
   exploit/windows/browser/adobe_flashplayer_newfunction     2010-06-04       normal     Adobe Flash Player "newfunction" Invalid Pointer Use
   exploit/windows/fileformat/adobe_flashplayer_button       2010-10-28       normal     Adobe Flash Player "Button" Remote Code Execution
   exploit/windows/fileformat/adobe_flashplayer_newfunction  2010-06-04       normal     Adobe Flash Player "newfunction" Invalid Pointer Use
   exploit/windows/fileformat/ms12_005                       2012-01-10       excellent  MS12-005 Microsoft Office ClickOnce Unsafe Object Package Handling Vulnerability
   exploit/windows/fileformat/winrar_name_spoofing           2009-09-28       excellent  WinRAR Filename Spoofing
   exploit/windows/ftp/easyftp_cwd_fixret                    2010-02-16       great      EasyFTP Server CWD Command Stack Buffer Overflow
   exploit/windows/http/sws_connection_bof                   2012-07-20       normal     Simple Web Server Connection Header Buffer Overflow
   post/windows/gather/credentials/razer_synapse                              normal     Windows Gather Razer Synapse Password Extraction

msf >
~~~

If you see this you should be good to go. Metasploit is a great tool for
testing your site for vulnerabilities and for testing your fixes.
