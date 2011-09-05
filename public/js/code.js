/* DO NOT MODIFY. This file was compiled Mon, 05 Sep 2011 02:24:07 GMT from
 * /users/sam/projects/sinatra/shoebox/public/js/code.coffee
 */

(function() {
  var SHOE, U;
  window.SHOE = SHOE = {
    images: {
      total: 9,
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
      ]
    }
  };
  _(SHOE.images).extend({
    fetch: function(set) {
      if (set == null) {
        set = 1341466;
      }
      return $.getJSON('/data?jsoncallback=?', SHOE.images.display);
    },
    pile: function(i) {
      return this.piles[Math.floor(i / (this.total / 3))];
    },
    place: function(pic, count, radius) {
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
      return pic.css({
        left: Math.min(limit.x, Math.max(0, pile.x + (radius * U.rand()) - pic.outerWidth() / 2)),
        top: Math.min(limit.y, Math.max(0, pile.y + (radius * U.rand()) - pic.outerHeight() / 2))
      });
    },
    stack: {
      topmost: function() {
        return _([
          _($('#canvas .pic')).chain().map(function(pic) {
            return ~~$(pic).css('z-index');
          }).max().value(), 0
        ]).max() + 1;
      },
      index: function(obj) {
        return parseInt($(obj).css('z-index')) || 0;
      },
      get: function(from) {
        var stack;
        stack = SHOE.images.stack;
        return $(_($('#canvas .pic').removeClass('topStack')).select(function(pic) {
          return stack.index(from) < stack.index(pic) && U.rect.intersect(U.rect.extract(from), U.rect.extract(pic));
        })).addClass('topStack');
      },
      _clear: function(from) {
        var delta, flip;
        flip = {
          '-=': '+=',
          '+=': '-='
        };
        delta = '75px';
        return $('.topStack').each(function() {
          var left, top;
          left = parseInt($(this).css('left')) < parseInt(from.css('left')) ? '-=' : '+=';
          top = parseInt($(this).css('top')) < parseInt(from.css('top')) ? '-=' : '+=';
          return $(this).animate({
            left: left + delta,
            top: top + delta
          }, 400).animate({
            left: flip[left] + delta,
            top: flip[top] + delta
          }, 400);
        });
      },
      clear: function(from) {
        this.get(from);
        this._clear(from);
        return _.delay((function() {
          return from.css('z-index', SHOE.images.stack.topmost());
        }), 300);
      }
    },
    events: {
      dblclick: function() {
        var that;
        that = $(this);
        SHOE.images.stack.clear(that);
        return that.rotate3Di('toggle', 700, {
          sideChange: function() {
            return that.toggleClass('flipped');
          }
        });
      },
      load: function() {
        var pic;
        pic = $(this).parents('.pic');
        pic.add(pic.find('.backside')).css({
          height: $(this).outerHeight(),
          width: $(this).outerWidth()
        }).end().data('rotation', 30 * U.rand()).transform({
          rotate: pic.data('rotation') + 'deg',
          scale: [1.25, 1.25]
        }).animate({
          scale: [[1, 1]]
        }, 600);
        SHOE.images.place(pic, SHOE.images.count++);
        return SHOE.images.events.allLoad();
      },
      allLoad: _.after(SHOE.images.total, function() {
        return $('#canvas .pic').draggable({
          containment: 'parent',
          start: function() {
            SHOE.images.stack.clear($(this));
            return $(this).animate({
              scale: [[1.25, 1.25]]
            }, 300);
          },
          stop: function() {
            return $(this).animate({
              scale: [[1, 1]]
            }, 300);
          }
        });
      })
    },
    display: function(data) {
      var e, item, _i, _len;
      data = data.photoset.photo.sort(function() {
        return U.rand();
      }).slice(0, SHOE.images.total);
      e = SHOE.images.events;
      $('#shoebox p').remove();
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        $('#canvas').append($('<div class="pic" />').html('<img src="' + item.url_s + '" /><div class="backside"><span>' + item.title + '</span></div>')).find('.pic:last').css('z-index', SHOE.images.stack.topmost());
      }
      return $('#canvas .pic').dblclick(e.dblclick).click(e.click).find('img').load(e.load);
    }
  });
  window.U = U = {
    line: {
      length: function(l) {
        return Math.sqrt(Math.pow(l[0].x - l[1].x, 2) + Math.pow(l[0].y - l[1].y, 2));
      },
      flatten: function(l) {
        if (l[0].x === l[1].x) {
          return [l[0].y, l[1].y];
        } else {
          return [l[0].x, l[1].x];
        }
      },
      intersect: function(l1, l2) {
        var points;
        points = _.union(this.flatten(l1), this.flatten(l2));
        return (_(points).max() - _(points).min()) <= (this.length(l1) + this.length(l2));
      }
    },
    rect: {
      extract: function(o) {
        var height, left, top, width;
        o = $(o);
        left = parseInt(o.css('left'));
        width = o.outerWidth();
        height = o.outerHeight();
        top = parseInt(o.css('top'));
        return {
          a: {
            x: left,
            y: top
          },
          b: {
            x: left + width,
            y: top
          },
          c: {
            x: left,
            y: top + height
          },
          d: {
            x: left + width,
            y: top + height
          }
        };
      },
      intersect: function(rect1, rect2) {
        return U.line.intersect([rect1.a, rect1.b], [rect2.a, rect2.b]) && U.line.intersect([rect1.a, rect1.c], [rect2.a, rect2.c]);
      }
    },
    rand: function() {
      return .5 - Math.random();
    },
    log: function(text, o) {
      console.log(text, o);
      return o;
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
