/* DO NOT MODIFY. This file was compiled Fri, 02 Sep 2011 02:47:39 GMT from
 * /Users/sam/projects/sinatra/shoebox/public/js/code.coffee
 */

(function() {
  var SHOE;
  window.SHOE = SHOE = {
    rand: function() {
      return .5 - Math.random();
    },
    images: {
      total: 30,
      get: function(set) {
        if (set == null) {
          set = 1341466;
        }
        return $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=a948a36e48c16afbf95a03c85418f417&photoset_id=' + set + '&format=json&extras=url_s&jsoncallback=?', SHOE.images.display);
      },
      place: function(img, pile, radius) {
        var limit;
        if (radius == null) {
          radius = 200;
        }
        limit = {
          x: $('#canvas').width(),
          y: $('#canvas').height()
        };
        pile = {
          x: limit.x * pile.x,
          y: limit.y * pile.y
        };
        return img.css({
          left: Math.min(limit.x, Math.max(0, pile.x + (radius * SHOE.rand()) - img.outerWidth() / 2)),
          top: Math.min(limit.y, Math.max(0, pile.y + (radius * SHOE.rand()) - img.outerHeight() / 2))
        });
      },
      display: function(data) {
        $('#shoebox p').remove();
        _(data.photoset.photo.sort(function() {
          return .5 - Math.random();
        })).chain().first(SHOE.images.total).each(function(value, key, list) {
          return $('#canvas').append('<a href="javascript:void(0)"><img src="' + value.url_s + '" /><span>' + value.title + '</span></a>');
        });
        $('#canvas a').each(function() {
          return $(this).data('rotation', 30 * SHOE.rand()).rotate($(this).data('rotation'));
        }).click(function() {
          var that;
          that = $(this);
          return that.flip({
            direction: 'lr',
            speed: 400,
            onAnimation: function() {
              return that.toggleClass('backside');
            }
          });
        }).find('img').load(function() {
          var count, pile;
          $(this).parent().css({
            height: $(this).outerHeight(),
            width: $(this).outerWidth()
          });
          count = Math.floor((--SHOE.images.total) / 10);
          pile = [
            {
              x: .25,
              y: .4
            }, {
              x: .75,
              y: .25
            }, {
              x: .6,
              y: .75
            }
          ][count];
          return SHOE.images.place($(this).parents('a'), pile);
        });
        return {
          otherFlip: function(that) {
            return that.hover(function() {
              return $(this).rotate({
                animateTo: 0,
                duration: 300
              });
            }, function() {
              return $(this).rotate({
                animateTo: $(this).data('rotation'),
                duration: 300
              });
            }).click(function() {
              var flip;
              flip = that.hasClass('backside') ? 'unflip' : 'flip';
              return that.rotate3Di(flip, 700, {
                sideChange: function(front) {
                  that.toggleClass('backside');
                  return that.data('front', front);
                }
              });
            });
          }
        };
      }
    }
  };
  $(function() {
    return SHOE.images.get();
  });
}).call(this);
