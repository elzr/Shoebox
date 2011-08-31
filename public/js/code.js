/* DO NOT MODIFY. This file was compiled Wed, 31 Aug 2011 06:15:48 GMT from
 * /users/sam/projects/sinatra/shoebox/public/js/code.coffee
 */

(function() {
  var SHOE;
  window.SHOE = SHOE = {
    images: {
      get: function(set) {
        if (set == null) {
          set = 1341466;
        }
        return $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=a948a36e48c16afbf95a03c85418f417&photoset_id=' + set + '&format=json&extras=url_s&jsoncallback=?', SHOE.images.display);
      },
      display: function(data) {
        $('#shoebox p').remove();
        _(data.photoset.photo.sort(function() {
          return .5 - Math.random();
        })).chain().first(30).each(function(value, key, list) {
          return $('#canvas').append('<a href="javascript:void(0)"><img src="' + value.url_s + '" /><span>' + value.title + '</span></a>');
        });
        return $('#canvas a').each(function() {
          return $(this).rotate(30 * (.5 - Math.random()));
        }).click(function() {
          var that;
          that = $(this);
          return that.flip({
            direction: 'lr',
            speed: 400,
            onEnd: function() {
              return that.toggleClass('backside');
            }
          });
        }).find('img').load(function() {
          return $(this).parent().css({
            height: $(this).outerHeight(),
            width: $(this).outerWidth()
          });
        });
      }
    }
  };
  $(function() {
    return SHOE.images.get();
  });
}).call(this);
