---
published: true
layout: post
title: Facilitating Bidirectional Cross-Domain Communication with an Iframe
date: "2014-08-12"
description: |
Using iframes in your app can be excruciating, especially when the iframe and the parent window are on two different domains. I'm going to go over the process of facilitating bi-directional communication between the iframe and it's parent window.

topic: application-development
---

I recently was working on a project where iframes seemed to be the most
logical solution. Actually, iframes I think are a perfectly reasonable tool
for some problems, but unfortunately the get a bad name because of their many
edge cases. I originally set out to create bi-directional event-based
communination between the iframe and it's parent, cross-browser, and
regardless of same or different origin (domain). Here I'm going to describe
the javascript I'm using as well as some of the backend code required to work
around certain browsers.

>__Note__: The below examples use jQuery.

### Window Message Events

The key to all of this is the `window.postMessage` call and the `message` event. Here are some snippets:

~~~ js
window.top.postMessage('message text', 'http://tastehoneyco.com')

$(window).on('message', function (e) {
  var message = e.originalEvent.data;
  // do something with the message.
});
~~~

This is a pretty minimal and easy to understand API. In my case, it seemed helpful to be able to send more complex messages, so I created a shared javascript file across the two domains that knows how to serialize and deserialize JSON messages containing named events. This allows for a more automated workflow:

~~~ js

// IframeMessages.prototype.iframe is an object that contains
// all of the events for the iframe. This code is used by the iframe.
IframeMessages.prototype.wrapper.activityFinished = function (id) {

};

// this code is ran by the parent window.
var iframe = new IframeMessages;
iframe.sendMessage('activityFinished', activity.id);
~~~

### Common use-case: Make my iframe the height of the iframe content!

This is probably the most common use-case for something like this. I've looked
into this quite a bit, and I am fairly confident there is no way to handle
this without polling the dimensions. Also, the child iframe __must__ send the
dimensions because the parent is unable to introspect on the iframe (on a
different domain). See the following snippet:

~~~ js
// turn on resize detection. Begins polling quill.org with content dimensions
// of module.
IframeMessages.prototype.autoResize = function () {
  // no wrapper, we are not in an iframe. Early exit.
  if (window.self == window.top) return;

  // modified from: http://stackoverflow.com/a/14901150/1397097
  function checkDocumentHeight (callback) {
    var lastHeight = $(document).height()
      , newHeight;

    // there doesn't seem to be a reliable way to detected wh
    setInterval(function () {
      newHeight = document.body.offsetHeight;
      if (lastHeight != newHeight) callback();
      lastHeight = newHeight;
    }, 400);
  }

  // send the dimensions to quill.org.
  function postWindowSize (first) {
    var data = {};

    if (first == 'first') {
      data.height = $(document).height();
    } else {
      data.height = document.body.offsetHeight;
    }

    this.sendMessage('resize', data);
  }

  checkDocumentHeight(postWindowSize.bind(this));
  postWindowSize.bind(this)('first');
};
~~~

and the resize event triggered on the parent:

~~~ js
// this is the handler for the resize event coming from the iframe.
// it contains the new dimensions of the content contained from within the iframe.
resize: function (dimensions) {
  this.$iframe.height(dimensions.height);
},
~~~

### Getting cookies to work

>__Note (2014-08-13)__: Newer versions of Chrome and other browsers seem to
block 3rd party cookies by default. I am still working on a workaround for
this.

If you've done this before on a different domain, you've probably noticed that
there are some issues cookies. Safari (and possibly other browsers) blocks
iframes on domains that the user hasn't visited from storing cookies. This
actually makes sense from a security / privacy perspective in most scenarios
(you wouldn't want an advertisement on a domain you've never visited to be
able to store cookies) but in our case it is very inconvenient. There is no
"hack" per se to get around this other than to actually navigate to the page
and then navigate back.

### Using postMessage with different domains

First, it is important that all frames are ready before attempting to use
`postMessage`. To get postMessage to work you must match the frame's host
*exactly* to get it work:

~~~ js
targetWindow.postMessage('message',       'http://locahost:3000')
targetWindow.postMessage('other message', 'https://example.com')
~~~

That's it for now! I'll post more tips and tricks later on when I've come up
with more.
