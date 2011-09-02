/* DO NOT MODIFY. This file was compiled Fri, 02 Sep 2011 05:26:22 GMT from
 * /Users/sam/projects/sinatra/shoebox/public/js/code.coffee
 */

(function() {
  var SHOE, U;
  window.SHOE = SHOE = {
    images: {
      total: 10,
      count: 0,
      piles: [
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
      ],
      fetch: function(set) {
        if (set == null) {
          set = 1341466;
        }
        return $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=a948a36e48c16afbf95a03c85418f417&photoset_id=' + set + '&format=json&extras=url_s&jsoncallback=?', SHOE.images.display);
      },
      pile: function(i) {
        return this.piles[Math.floor(i / (this.total / 3))];
      },
      place: function(img, count, radius) {
        var limit, pile;
        if (radius == null) {
          radius = 200;
        }
        limit = {
          x: $('#canvas').width(),
          y: $('#canvas').height()
        };
        pile = this.pile(count);
        pile = {
          x: limit.x * pile.x,
          y: limit.y * pile.y
        };
        return img.css({
          left: Math.min(limit.x, Math.max(0, pile.x + (radius * U.rand()) - img.outerWidth() / 2)),
          top: Math.min(limit.y, Math.max(0, pile.y + (radius * U.rand()) - img.outerHeight() / 2))
        });
      },
      build: function() {
        var a, img;
        a = $(this).parents('a');
        img = $(this);
        SHOE.moko = img;
        a.data('rotation', 30 * U.rand()).rotate(a.data('rotation') + 'deg');
        a.css({
          height: img.outerHeight(),
          width: img.outerWidth()
        });
        return SHOE.images.place(a, SHOE.images.count++);
      },
      display: function(data) {
        var item, _i, _len;
        data = data.photoset.photo.sort(function() {
          return U.rand();
        }).slice(0, SHOE.images.total);
        $('#shoebox p').remove();
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          item = data[_i];
          $('#canvas').append('<a href="javascript:void(0)"><img src="' + item.url_s + '" /><span>' + item.title + '</span></a>');
        }
        $('#canvas a').hover(function() {
          return $(this).animate({
            rotate: 0
          }, 450);
        }, function() {
          return $(this).animate({
            rotate: $(this).data('rotation')
          }, 450);
        }).dblclick(function() {
          var that;
          that = $(this);
          return that.rotate3Di('toggle', 700, {
            sideChange: function() {
              return that.toggleClass('backside');
            }
          });
        }).find('img').load(SHOE.images.build);
        return $(window).load(function() {
          return $('#canvas a').draggable({
            containment: 'parent',
            stop: function() {
              return $(this).css('z-index', 3);
            }
          });
        });
      }
    }
  };
  U = {
    rand: function() {
      return .5 - Math.random();
    },
    print: function(obj) {
      var key, value;
      return '{' + ((function() {
        var _results;
        _results = [];
        for (key in obj) {
          value = obj[key];
          _results.push("" + key + ":" + ($.isPlainObject(value) ? U.print(value) : value));
        }
        return _results;
      })()).join(', ') + '}';
    }
  };
  $(function() {
    return SHOE.images.fetch();
  });
}).call(this);
