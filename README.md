# infinitescroll
A YUI Plugin for Squarespace blogs to add Infinite Scrolling functionality to Blog pages

##api
<pre>
new Y.Squarespace.InfiniteScroll({
  contentWrapper: null,           // the wrapper to append new blog items to (default is #blogWrapper)
  ajaxClass: null,                // adds a class to the items fetched by ajax (default is .ajax-items)
  newerPostsLink: null,           // the link to grab the next URL of items (default is #newer)
  olderPostsLink: null,           // the link to grab the previous URL of items (default is #older)
  queryString: null,              // the query string to attach to the ajax request (default is &format=main-content)
  loadingAnimationClass: null,    // Include this if you want a loading animation (default is .pulses)
  ajaxDelay: null,                // Include a delay time for ajax, in seconds (default is 0, one second is 1)
  loadOnClick: null               // Default behavior is ajax request on scroll to bottom, set this to true to include a load more button instead
});
</pre>

##how to use it
* Copy or download infinitescroll.js and add it to your /scripts folder in Developer Mode
* include 'infinite-scroll' in the list of dependencies for YUI (usually found in scripts/site.js).  Example:
<pre>
  YUI().use('infinite-scroll', function(Y){
    Y.on('domready', function() {
      new Y.Squarespace.InfiniteScroll({
        // your configuration options here
      });
    });
  });
</pre>
* You're good to go!
