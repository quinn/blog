---
published: true
layout: post
title: Change the default port that rails uses
date: "2014-09-15"
description: |
  Just a quick tip to save you from writing "-p 1234" on the command line.

topic: application-development
---

This is a bit hackish, I'd love to know if there is a more "official" solution
out there. This works on versions 3.2 and 4.0 from what I can tell.

The way I've found to do this is to add the following lines to `config/boot.rb`:

~~~ ruby
require 'rails/commands/server'

module Rails
  class Server
    def default_options
      super.merge!(:Port => 1234)
    end
  end
end
~~~

just change `:Port => XXXX` to whatever you want it to be. From now on you can
simple start rails with `rails s` and it will use the port you specified. If
you are looking for a more robust solution consider checking out Pow:
http://pow.cx/.
