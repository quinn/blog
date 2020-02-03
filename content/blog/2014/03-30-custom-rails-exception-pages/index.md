---
layout: post
title: Custom error pages in Rails
date: "2014-03-30"
description: |
 I know this has been documented many times, but I felt this was necessary because I am still seeing many more descriptions of the "wrong" way to do this rather than the right way. Hopefully I can help tip the scales a bit on the subject.

topic: application-development
---

This has been previously documented, but the predominant way is this:

https://gist.github.com/gonzedge/1563416

There are a number of things obviously wrong with this, and I always disliked
this technique because it completely overrode rails' existing handling of
exceptions which already intelligently mapped exceptions to status codes. I
assumed their must be a way to use this functionality and only override the
part where the exception is actually rendered. I began digging, and found this
in actionpack:

~~~ ruby
require 'action_dispatch/http/request'
require 'action_dispatch/middleware/exception_wrapper'

module ActionDispatch
  # This middleware rescues any exception returned by the application
  # and calls an exceptions app that will wrap it in a format for the end user.
  #
  # The exceptions app should be passed as parameter on initialization
  # of ShowExceptions. Every time there is an exception, ShowExceptions will
  # store the exception in env["action_dispatch.exception"], rewrite the
  # PATH_INFO to the exception status code and call the rack app.
  #
  # If the application returns a "X-Cascade" pass response, this middleware
  # will send an empty response as result with the correct status code.
  # If any exception happens inside the exceptions app, this middleware
  # catches the exceptions and returns a FAILSAFE_RESPONSE.
  class ShowExceptions
    FAILSAFE_RESPONSE = [500, { 'Content-Type' => 'text/plain' },
      ["500 Internal Server Error\n" \
       "If you are the administrator of this website, then please read this web " \
       "application's log file and/or the web server's log file to find out what " \
       "went wrong."]]

    def initialize(app, exceptions_app)
      @app = app
      @exceptions_app = exceptions_app
    end

    def call(env)
      @app.call(env)
    rescue Exception => exception
      raise exception if env['action_dispatch.show_exceptions'] == false
      render_exception(env, exception)
    end

    private

    def render_exception(env, exception)
      wrapper = ExceptionWrapper.new(env, exception)
      status  = wrapper.status_code
      env["action_dispatch.exception"] = wrapper.exception
      env["PATH_INFO"] = "/#{status}"
      response = @exceptions_app.call(env)
      response[1]['X-Cascade'] == 'pass' ? pass_response(status) : response
    rescue Exception => failsafe_error
      $stderr.puts "Error during failsafe response: #{failsafe_error}\n  #{failsafe_error.backtrace * "\n  "}"
      FAILSAFE_RESPONSE
    end

    def pass_response(status)
      [status, {"Content-Type" => "text/html; charset=#{Response.default_charset}", "Content-Length" => "0"}, []]
    end
  end
end
~~~

As you can see, this middleware uses something called `ExceptionWrapper` to
(presumably) convert the original exception to an HTTP status code. It also
conveniently assigns it to the path ("/404", "/500", etc) and passes it to a
configurable exceptions_app. Further digging found this in
`railties/lib/rails/application.rb`:

~~~ ruby
# ~ line 335
middleware.use ::ActionDispatch::ShowExceptions, show_exceptions_app

# ~ line 391
def show_exceptions_app
  config.exceptions_app || ActionDispatch::PublicExceptions.new(Rails.public_path)
end
~~~

Ok, great. This provides an easy way to hook into the ShowExceptions
middleware by overriding the config.exceptions_app. In my app I put this:

~~~ ruby
# config/application.rb
config.exceptions_app = Proc.new do |env|
  # all controllers are middleware, remember?
  ApplicationController.action(:show_errors).call(env)
end

# application_controller.rb
def show_errors
  status = env["PATH_INFO"][1..-1]

  respond_to do |format|
    format.html { render template: "errors/#{status}", layout: 'layouts/application', status: status }
    format.all { render nothing: true, status: status }
  end
end
~~~

This is pretty straightforward I think, but after looking around a bit more I
found a solution by [José Valim][jose] that may be considered even more
elegant to some:

~~~ ruby
# config/application.rb
config.exceptions_app = self.routes

# routes.rb
match "/404", :to => "errors#not_found"
~~~

Regardless of how you decide to handle this, I think the most important take
away is that Rails almost always provides a way to exploit the functionality
it provides as a framework. Rarely do you have to "fight against" the
framework and recreate existing functionality to get the behavior you want.

[jose]: http://blog.plataformatec.com.br/2012/01/my-five-favorite-hidden-features-in-rails-3-2/