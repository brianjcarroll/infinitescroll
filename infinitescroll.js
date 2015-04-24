/* TODO:

proper comments
make loading animation prettier
update location bar URL
update history

change location URL when scrolling past posts from an offset
auto scroll to first new loaded post title?

logic if there is no loadingAnimationClass



DONE:

determine when scrolled to bottom
Get data from offset URL
Append items to contentWrapper
update URL of the previous post link for next get request
initialize squarespace blocks
add logic for when there are no more prev URLs
add loading animation
add logic for when there are no more next URLs
Option to choose between load more button and scroll to load
Load posts on item view as well? Or disable plugin on item? -- disabled on item view.
debounce ajax loading or make it smarter so it doesnt accidentally load the same request twice (simple flag)

*/


YUI.add('infinite-scroll', function (Y) {
  Y.namespace('Squarespace').InfiniteScroll = Y.Base.create('infiniteScroll', Y.Base, [], {

    initializer: function (config) {
      this.bindUI();

    },

    destructor: function () {

    },

    /* Add Event listeners here */

    bindUI: function () {
      // this.scrolledToBottom();

      // Defaults to load on scroll, unless config is set to load on prev post button click
      if(!Y.one(this.get('contentWrapper'))){
        console.log('not a blog page');
        return false;

      } else {
        if(this.get('loadOnClick')){
          Y.one(this.get('olderPostsLink')).on('click', Y.bind(function (e){
            e.preventDefault();
            // this.showLoadingAnimation();
            this.getData();       
          }, this));
        } else {
          Y.on('scroll', Y.bind(this.scrolledToBottom, this));
        }
      }
    },

    /* Gate to stop getData() when there are no more offset pages */

    morePagesToLoad: true,

    /* Gate to stop ajax from firing too many times */

    ajaxFired: false,

    /* This function checks how far down the user has scrolled */

    getScrollPosition: function (e) {
      if(document.documentElement.scrollTop) {
        return document.documentElement.scrollTop;
      } 
      else {
        return document.body.scrollTop;
      }
      
    },

    /* This function checks the height of the visible portion of the document */

    getVisibleDocHeight: function (e) {
      if(document.documentElement.clientHeight) {
        return document.documentElement.clientHeight;
      }
      else {
        return document.body.clientHeight;
      }     
    },

    /* This function checks the total height of the document */

    getTotalDocHeight: function (e) {
      if (document.documentElement.offsetHeight) {
        return document.documentElement.offsetHeight;
      } 
      else {
        return document.body.offsetHeight;
      }
    },

    /* This function returns true if the user is at the very bottom of the document */

    scrolledToBottom: function (e) {

      if(this.getTotalDocHeight() == this.getScrollPosition() + this.getVisibleDocHeight()){
        this.getData();
      }

    },

    /* This function makes the AJAX call to the next blog page */

    getData: function () {
      var location = Y.config.win.location;
      var request = Y.config.win.location.href.replace(location.href, Y.one(this.get('olderPostsLink')).getAttribute('href') + this.get('queryString'));

      if(!this.ajaxFired){
        this.ajaxFired = true;
        

        // this is wrapped in Y.later so the user can set a delay on the animation (or none at all)

        if(this.morePagesToLoad){
          this.showLoadingAnimation();
          Y.later( 1000 * this.get('ajaxDelay'), this, function(){
            Y.Data.get({
              url: request,
              responseFormat: 'raw',
              success: function(data) {
                this.appendItems(data);
                this.initSquarespaceBlocks();
                this.updatePaginationUrl(data);
                this.hideLoadingAnimation();
                this.ajaxFired = false;
              },
              failure: function(error) {
                console.log(error);
                this.hideLoadingAnimation();
                this.ajaxFired = false;
              }
            }, this);   
          }, [], false);

        } else {
          console.log('no more pages to load!');
          this.ajaxFired = false;
          return;
        }
      }
      
    },

    /* This function adds the data from the AJAX call to the DOM */

    appendItems: function (data) {
      var items = this.createDOM(data);
      var wrapper = Y.one(this.get('contentWrapper'));

      items.each(function (post){
        wrapper.appendChild(post);
      });
    },

    /* Grab articles from the document fragment */

    createDOM: function (data) {
      var dom = Y.DOM.create(data);
      console.log(dom);
      var blog = dom.querySelector(this.get('contentWrapper'));

      blog.setAttribute('class', this.get('ajaxClass').replace(/\./g, ''));

      var ajaxItems = dom.querySelector(this.get('ajaxClass'));

      return Y.one(ajaxItems).get('children');
    },

    updatePaginationUrl: function (data) {
      var dom = Y.DOM.create(data);

      var olderPostsLink = dom.querySelector(this.get('olderPostsLink')).getAttribute('href');

      if(!olderPostsLink) {
        this.morePagesToLoad = false;
        Y.one(this.get('olderPostsLink')).hide();
      } else {
        Y.one(this.get('olderPostsLink')).setAttribute('href', olderPostsLink);
      }

    },

    initSquarespaceBlocks: function () {

      Squarespace.afterBodyLoad();

      Y.one(this.get('contentWrapper')).all('img[data-src]').each(function (el) {
        ImageLoader.load(el, {
          load: true
        });
      });

      Y.one(this.get('contentWrapper')).all('.sqs-search-ui-text-input').each(function (search) {
        if (!search.one('.yui3-widget')) {
          new Y.Squarespace.Widgets.SearchPreview({
            render: search
          });
        }
      }, this);      

    },

    showLoadingAnimation: function () {

      if(this.morePagesToLoad) {
        var loading = Y.Node.create('<div class="loading-container"><div class="' + this.get('loadingAnimationClass').replace(/\./g, '') + '"></div></div>');
        if(Y.one(this.get('loadingAnimationClass'))){
          Y.one(this.get('loadingAnimationClass')).remove(true);
          // Y.one(this.get('contentWrapper')).append(loading);
          Y.one('body').append(loading);
        } else {
          // Y.one(this.get('contentWrapper')).append(loading);
          Y.one('body').append(loading);
        }        
      }
      
    },

    hideLoadingAnimation: function () {
      if(Y.one(this.get('loadingAnimationClass'))){
        Y.one(this.get('loadingAnimationClass')).remove(true);
      }
      
    }


  }, {
    NS: 'InfiniteScroll',
    ATTRS: {
      contentWrapper: {
        value: '#blogWrapper'
      },
      ajaxClass: {
        value: '.ajax-items'
      },
      newerPostsLink: {
        value: '#newer'
      },
      olderPostsLink: {
        value: '#older'
      },
      queryString: {
        value: '&format=main-content'
      },
      loadingAnimationClass: {
        value: '.pulses'
      },
      ajaxDelay: {
        value: 0
      },
      loadOnClick: {
        value: false
      }
    }
  },

  '1.0',

    {
      requires: [
        'base',
        'node-base',
        'plugin',
        'event',
        'node',
        'node-event-delegate',
        'anim',
        'transition',
        'io-base'
      ]
    }
  );
});
