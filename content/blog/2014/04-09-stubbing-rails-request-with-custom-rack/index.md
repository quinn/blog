---
layout: post
title: Stubbing Rails request with custom Rack env
date: "2014-04-09"
description: |
  There are plenty of tools that provide easy ways to do controller testing in rails, but sometimes in can be nice to test against a specifically built rack env when testing a controller or middleware. Here I dig through some Rails internals to figure out some different ways of doing this.

topic: application-development
---

If you are are using the `rspec-rails` gem you should know that there are a
ton of really good ways to test controllers. But, sometimes it can be nice to
have total control over the input that is going to your controller. I'm going
to show you how to construct a request as a rack environment as well as a
request path.

To find a good intersection point for us to build a stub rack environment and
inject it into Rail's request life-cycle, let's look at where in the Rails code
the controller get called from the router:

~~~ ruby
# action_pack/routing/route_set.rb

def call(env)
  params = env[PARAMETERS_KEY]

  # If any of the path parameters has a invalid encoding then
  # raise since it's likely to trigger errors further on.
  params.each do |key, value|
    next unless value.respond_to?(:valid_encoding?)

    unless value.valid_encoding?
      raise ActionController::BadRequest, "Invalid parameter: #{key} => #{value}"
    end
  end

  prepare_params!(params)

  # Just raise undefined constant errors if a controller was specified as default.
  unless controller = controller(params, @defaults.key?(:controller))
    return [404, {'X-Cascade' => 'pass'}, []]
  end

  dispatch(controller, params[:action], env)
end
~~~

Let's look at the definition of `controller()`

~~~ ruby
# If this is a default_controller (i.e. a controller specified by the user)
# we should raise an error in case it's not found, because it usually means
# a user error. However, if the controller was retrieved through a dynamic
# segment, as in :controller(/:action), we should simply return nil and
# delegate the control back to Rack cascade. Besides, if this is not a default
# controller, it means we should respect the @scope[:module] parameter.
def controller(params, default_controller=true)
  if params && params.key?(:controller)
    controller_param = params[:controller]
    controller_reference(controller_param)
  end
rescue NameError => e
  raise ActionController::RoutingError, e.message, e.backtrace if default_controller
end
~~~

It's easy to tell that this the business logic for translating
`params[:controller] = 'articles'` into `ArticlesController`. We can safely
assume that a controller class is now stored in the `controller` variable. Now
let's look at the definition of `dispatch()`:

~~~ ruby
def dispatch(controller, action, env)
  controller.action(action).call(env)
end
~~~

That's a pretty clean API. If we want to test a specific controller and
action, this would be a great place to intersect. Let's take a look at that:

~~~ ruby
ArticlesController.action(:show).call({})
~~~

This won't work unfortunately, there is a minimum amount of parameters
necessary to get a request to actually work. This is what I've used with some
success:

~~~ ruby
ArticlesController.action(:show).call({
  "rack.input"     => StringIO.new(""),
  "REQUEST_METHOD" => "POST",
  "HTTP_ACCEPT"    => "text/html",
  "HTTP_HOST"      => options[:host],
  "rack.session"   => Hashie::Mash.new,
  'action_dispatch.cookies' => Hashie::Mash.new,
  "action_dispatch.request.parameters" => {
    id: 1
  }
})
~~~

As you can see, this allows you to stub your own rack environment with the
parameters that work for your scenario. Most of the time this won't be
necessary with the testing tools that are available but it can be useful every
once and awhile.
