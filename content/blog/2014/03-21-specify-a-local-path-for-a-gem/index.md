---
layout: post
title: Specify a local path for a gem in your Gemfile
date: "2014-03-21"
description: |
  Sometimes it can be nice to develop against a local gem without modifying
  your Gemfile. Bundler provides a convenient mechanism for this, but it is
  limited in the scenarios that it will work under. Here I describe a simple
  approach to get a similar effect.

topic: application-development
---

Bundler provides a mechanism to override a gem with a local one which works as
follows:

``` sh
bundle config local.GEM_NAME /path/to/local/git/repository
```

This is great and easy to understand. Unfortunately, it only works if the gem
is pulling from git in the Gemfile:

``` ruby
gem 'GEM_NAME', github: 'your/gem', branch: 'master'
```

This is great in some cases, but in others I'd rather develop against a gem
and not modify the Gemfile when I am ready to deploy. The hack I came up with
is to use two gemfiles. Create a file called `Gemfile.local`:

``` ruby
# Gemfile.local
eval File.read(File.expand_path('../Gemfile', __FILE__))
@dependencies.delete @dependencies.find { |d| d.name == 'GEM_NAME' }
gem 'GEM_NAME', path: 'path/to/local/gem'
```

This file loads the original `Gemfile`, finds the gem, and redefines it to
point to your local gem. Next, run:

``` sh
bundle install --gemfile=Gemfile.local
```

You only have to run this once with the extra option. bundler will remember
the choice to use `Gemfile.local` in `.bundle/config`. This will generate a
separate lock file as well.

From this point forward, Bundler should now reference your local gem, but
still use the actual gem in other environments. If you'd like to revert to
using the original Gemfile, just remove the line from `.bundle/config`.
