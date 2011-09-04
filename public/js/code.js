/* DO NOT MODIFY. This file was compiled Sun, 04 Sep 2011 23:52:51 GMT from
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
    stack: {
      topmost: function() {
        return _([
          _($('#canvas a')).chain().map(function(a) {
            return $(a).css('z-index');
          }).without('auto').max().value(), 0
        ]).max() + 1;
      },
      index: function(obj) {
        return U.log('log ', parseInt($(obj).css('z-index')) || 0);
      },
      get: function(from) {
        var stack;
        stack = SHOE.images.stack;
        return $(_($('#canvas a').removeClass('topStack')).select(function(img) {
          return U.log('indexes ', stack.index(from) < stack.index(img)) && U.log('intersect ', U.rect.intersect(U.rect.extract(from), U.rect.extract(img)));
        })).addClass('topStack');
      },
      _clear: function(from) {
        var delta, flip;
        flip = {
          '-=': '+=',
          '+=': '-='
        };
        delta = 75;
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
        return this._clear(from);
      }
    },
    events: {
      enter: function() {
        if ($('.ui-draggable-dragging').length === 0) {
          return $(this).animate({
            rotate: 0
          }, 450);
        }
      },
      out: function() {
        if ($('.ui-draggable-dragging').length === 0) {
          return $(this).animate({
            rotate: $(this).data('rotation')
          }, 450);
        }
      },
      dblclick: function() {
        var that;
        that = $(this);
        SHOE.images.stack.clear(that);
        return that.css('z-index', SHOE.images.stack.topmost()).rotate3Di('toggle', 700, {
          sideChange: function() {
            return that.toggleClass('backside');
          }
        });
      },
      load: function() {
        var a;
        a = $(this).parents('a');
        a.css({
          height: $(this).outerHeight(),
          width: $(this).outerWidth()
        }).data('rotation', 30 * U.rand()).rotate(a.data('rotation') + 'deg').scale(1.25).animate({
          scale: 1
        }, 600);
        SHOE.images.place(a, SHOE.images.count++);
        return SHOE.images.events.allLoad();
      },
      allLoad: _.after(SHOE.images.total, function() {
        return $('#canvas a').draggable({
          containment: 'parent',
          start: function() {
            SHOE.images.stack.clear($(this));
            return $(this).animate({
              scale: 1.25
            }, 300).css('z-index', SHOE.images.stack.topmost());
          },
          stop: function() {
            return $(this).animate({
              scale: 1
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
        $('#canvas').append('<a href="javascript:void(0)"><img src="' + item.url_s + '" /><span>' + item.title + '</span></a>').find('a:last').css('z-index', SHOE.images.stack.topmost());
      }
      return $('#canvas a').hover(e.enter, e.out).dblclick(e.dblclick).click(e.click).find('img').load(e.load);
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
