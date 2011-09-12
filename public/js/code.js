/* DO NOT MODIFY. This file was compiled Mon, 12 Sep 2011 04:30:18 GMT from
 * /users/sam/projects/sinatra/shoebox/public/js/code.coffee
 */

(function() {
  var PIC, U;
  window.PIC = PIC = {
    total: 9,
    count: 0,
    rotation: 60,
    sets: {
      abstract: '72157625438391339',
      obama: '72157626767345322',
      models: '72157606203394154',
      sexy: '72157607176703404',
      family5: '72157626228862861',
      family4: '72157610172574733',
      family3: '72157625806894425',
      family2: '72157594183166324',
      family1: '72157594172843597',
      faces: '72157605579131380',
      inventors: '72157605338975676',
      bw: '72157607708666180',
      objects: '72057594050733003',
      portman: '1476952'
    }
  };
  _(PIC).extend({
    fetch: function(set, size) {
      if (set == null) {
        set = false;
      }
      if (size == null) {
        size = false;
      }
      set = set || this.sets['family2'];
      PIC.total = size || PIC.total;
      return $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=a948a36e48c16afbf95a03c85418f417&photoset_id=' + set + '&format=json&extras=url_s&jsoncallback=?', PIC.display);
    },
    place: {
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
      pile: function(i) {
        return this.piles[Math.floor(i / (PIC.total / 3))];
      },
      arrange: function(pic, count, radius) {
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
      }
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
        return $(obj).css('z-index') || 0;
      },
      get: function(atopBelow, from) {
        atopBelow = {
          atop: 1,
          below: -1
        }[atopBelow];
        return $(_($('#canvas .pic').removeClass('topStack')).select(function(pic) {
          return atopBelow * PIC.stack.index(from) < atopBelow * PIC.stack.index(pic) && U.rect.intersect(U.rect.extract(from), U.rect.extract(pic));
        }));
      },
      _clear: function(stack, from) {
        var delta, flip;
        flip = {
          '-=': '+=',
          '+=': '-='
        };
        delta = '75px';
        return stack.each(function() {
          var left, top;
          left = U.float($(this).css('left')) < U.float(from.css('left')) ? '-=' : '+=';
          top = U.float($(this).css('top')) < U.float(from.css('top')) ? '-=' : '+=';
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
        this._clear(this.get('atop', from), from);
        return _.delay((function() {
          return from.css('z-index', PIC.stack.topmost());
        }), 300);
      }
    },
    physics: {
      dangle: {
        start: function(pic) {
          this.stop(pic);
          this._dangle(pic);
          return $(pic).data('dangle', window.setInterval((function() {
            return PIC.physics.dangle._dangle(pic);
          }), 600));
        },
        stop: function(pic) {
          return window.clearInterval($(pic).data('dangle'));
        },
        _dangle: function(pic) {
          var r;
          r = $(pic).data('rotation') / 1.5 * -1;
          if (Math.abs(r) < 5) {
            r = 0;
            this.stop(pic);
          }
          $(pic).data('rotation', r);
          return $(pic).animate({
            rotate: r + 'deg'
          }, {
            duration: 600,
            queue: false
          });
        }
      },
      vector: function(pic) {
        var before, now;
        before = $(pic).data('position.before');
        now = $(pic).position();
        return {
          x: now.left - before.left,
          y: now.top - before.top
        };
      },
      friction: function(pic) {
        var damp, r, vector;
        vector = this.vector(pic);
        damp = 500;
        r = $(pic).data('rotation') + (30 * vector.x / damp) + (15 * vector.y / damp);
        r = r > 0 ? Math.min(r, PIC.rotation) : Math.max(r, -PIC.rotation);
        $(pic).data('rotation', r);
        return {
          rotate: r + 'deg'
        };
      },
      toss: function(pic) {
        var damp, vector;
        vector = this.vector(pic);
        damp = 2;
        $(pic).css({
          leftToss: 0,
          topToss: 0
        }).data({
          left: {
            original: U.float($(pic).css('left')),
            toss: vector.x / damp,
            before: 0,
            bounce: 1
          },
          top: {
            original: U.float($(pic).css('top')),
            toss: vector.y / damp,
            before: 0,
            bounce: 1
          }
        });
        return {
          leftToss: 100,
          topToss: 100
        };
      },
      shuffle: function(pic) {
        return PIC.stack.get('below', pic).each(function() {
          return $(this).data('rotation', $(this).data('rotation') + (PIC.rotation * U.rand())).animate({
            rotate: $(this).data('rotation')
          }, {
            duration: 500,
            queue: false
          });
        });
      }
    },
    events: {
      dblclick: function() {
        var that;
        that = $(this);
        PIC.stack.clear(that);
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
        }).end().data('rotation', PIC.rotation * U.rand()).transform({
          rotate: pic.data('rotation') + 'deg',
          scale: U.xy(1.35)
        }).data('scale', 1 + (.5 * U.rand())).animate({
          scale: [U.xy(pic.data('scale'))]
        }, 600);
        PIC.place.arrange(pic, PIC.count++);
        return PIC.events.allLoad();
      },
      drag: {
        start: function() {
          PIC.stack.clear($(this));
          $(this).animate({
            scale: [U.xy(1.5)]
          }, 300);
          return $(this).data('position.before', $(this).position());
        },
        "while": function() {
          PIC.events.drag.whiles[0].call(this);
          return PIC.events.drag.whiles[1].call(this);
        },
        whiles: [
          _.throttle(function() {
            if ($('.ui-draggable-dragging').length > 0) {
              $(this).animate(PIC.physics.friction(this), {
                duration: 200,
                queue: false
              });
              return PIC.physics.dangle.start(this);
            }
          }, 250), _.throttle(function() {
            return $(this).data('position.before', $(this).position());
          }, 500)
        ],
        stop: function() {
          PIC.physics.dangle.stop(this);
          $(this).animate($.extend({
            scale: [U.xy($(this).data('scale'))]
          }, PIC.physics.toss(this), PIC.physics.friction(this)), {
            duration: 1000,
            step: PIC.events.step
          });
          return _.delay(PIC.physics.shuffle, 500, this);
        },
        setup: function() {
          return $('#canvas .pic').draggable({
            containment: 'parent',
            start: this.start,
            drag: this["while"],
            stop: this.stop
          });
        }
      },
      trash: {
        "delete": function(event, ui) {
          $(ui.draggable).fadeOut();
          return $(this).attr('src', '/img/ico/trash-full.png');
        },
        restore: function() {
          $('#canvas .pic:hidden').fadeIn();
          return $(this).attr('src', '/img/ico/trash-empty.png');
        },
        setup: function() {
          return $('.trash').droppable({
            accept: '.pic',
            hoverClass: 'hover',
            tolerance: 'touch',
            drop: this["delete"]
          }).click(this.restore);
        }
      },
      step: function(now, fx) {
        var hw, lt, param, pic, prop, quanta;
        if (fx.prop === 'leftToss' || fx.prop === 'topToss') {
          lt = fx.prop === 'leftToss' ? 'left' : 'top';
          pic = $(fx.elem);
          param = pic.data(lt);
          quanta = ((now - (param.before || 0)) / 100) * param.toss;
          param.before = now;
          prop = U.float(pic.css(lt)) + ((param.bounce || 1) * quanta);
          hw = fx.prop === 'topToss' ? 'height' : 'width';
          if ((prop + pic[hw]() > $('#canvas')[hw]() - 60) || prop < 0) {
            param.bounce = (param.bounce || 1) * -1.5;
          }
          pic.css(lt, U.float(pic.css(lt)) + (param.bounce || 1) * quanta);
          return param = pic.data(lt, param);
        }
      },
      allLoad: _.after(1, function() {
        PIC.events.drag.setup();
        return PIC.events.trash.setup();
      })
    },
    display: function(data) {
      var e, item, _i, _len;
      data = data.photoset.photo.sort(function() {
        return U.rand();
      }).slice(0, PIC.total);
      e = PIC.events;
      $('#shoebox').find('.loading').remove();
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        $('#canvas').append($('<div class="pic" />').html('<img src="' + item.url_s + '" /><div class="backside"><span>' + item.title + '</span></div>')).find('.pic:last').css('z-index', PIC.stack.topmost());
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
      },
      draw: function(a, b) {
        var canvas, context;
        canvas = $('canvas')[0];
        context = canvas.getContext('2d');
        context.moveTo(a.x || a.left, a.y || a.top);
        context.lineTo(b.x || b.left, b.y || b.top);
        context.lineWidth = 5;
        context.strokeStyle = 'red';
        return context.stroke();
      }
    },
    rect: {
      extract: function(o) {
        var height, left, top, width;
        o = $(o);
        left = U.float(o.css('left'));
        width = o.outerWidth();
        height = o.outerHeight();
        top = U.float(o.css('top'));
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
    xy: function(n) {
      return [n, n];
    },
    float: function(str) {
      return parseFloat(str);
    },
    log: function(text, o) {
      if (o) {
        console.log(text, U.print(o));
        return o;
      } else {
        console.log(U.print(text));
        return text;
      }
    },
    print: function(obj) {
      var key, value;
      if (!$.isPlainObject(obj)) {
        return obj;
      } else {
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
    }
  };
  $(function() {
    $('#canvas, .background').css('height', U.log('h', $(window).height() - 60));
    $('#shoebox').css('padding-top', $(window).height() - 60);
    return $('canvas').attr({
      width: $('#canvas').width(),
      height: $('#canvas').height()
    });
  });
}).call(this);
