/* DO NOT MODIFY. This file was compiled Wed, 14 Sep 2011 03:49:43 GMT from
 * /Users/sam/projects/sinatra/shoebox/public/js/code.coffee
 */

(function() {
  var PIC, U;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
  (_(PIC)).extend({
    fetch: function(set, size) {
      set || (set = this.sets['family2']);
      PIC.total = size || PIC.total;
      return $.getJSON("http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=a948a36e48c16afbf95a03c85418f417&photoset_id=" + set + "&format=json&extras=url_s&jsoncallback=?", PIC.display);
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
          x: ($('#canvas')).width(),
          y: ($('#canvas')).height()
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
        var pic;
        return _((function() {
          var _i, _len, _ref, _results;
          _ref = $('#canvas .pic');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            pic = _ref[_i];
            _results.push(~~($(pic)).css('z-index'));
          }
          return _results;
        })()).max() + 1;
      },
      index: function(obj) {
        return $(obj).css('z-index') || 0;
      },
      get: function(atopBelow, from) {
        var flip, pic, _i, _len, _ref, _results;
        flip = {
          atop: 1,
          below: -1
        }[atopBelow];
        _ref = ($('#canvas .pic')).removeClass('topStack');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pic = _ref[_i];
          if (flip * this.index(from) < flip * this.index(pic) && U.rect.intersect(from, pic)) {
            _results.push(pic);
          }
        }
        return _results;
      },
      _clear: function(stack, from) {
        var delta, flip, left, pic, top, _i, _len, _ref, _results;
        _ref = [
          {
            '-=': '+=',
            '+=': '-='
          }, '75px', $(from)
        ], flip = _ref[0], delta = _ref[1], from = _ref[2];
        _results = [];
        for (_i = 0, _len = stack.length; _i < _len; _i++) {
          pic = stack[_i];
          left = U.float(($(pic)).css('left')) < U.float(from.css('left')) ? '-=' : '+=';
          top = U.float(($(pic)).css('top')) < U.float(from.css('top')) ? '-=' : '+=';
          _results.push(($(pic)).animate({
            left: left + delta,
            top: top + delta
          }, 400).animate({
            left: flip[left] + delta,
            top: flip[top] + delta
          }, 400));
        }
        return _results;
      },
      clear: function(from) {
        this._clear(this.get('atop', from), from);
        return _.delay((__bind(function() {
          return ($(from)).css('z-index', this.topmost());
        }, this)), 300);
      }
    },
    physics: {
      dangle: {
        start: function(pic) {
          this.stop(pic);
          this._dangle(pic);
          return ($(pic)).data('dangle', window.setInterval(__bind(function() {
            return this._dangle(pic, 600);
          }, this)));
        },
        stop: function(pic) {
          return clearInterval(($(pic)).data('dangle'));
        },
        _dangle: function(pic) {
          var r;
          r = (($(pic)).data('rotation')) / 1.5 * -1;
          if (Math.abs(r < 5)) {
            r = 0;
            this.stop(pic);
          }
          ($(pic)).data('rotation', r);
          return ($(pic)).animate({
            rotate: r + 'deg'
          }, {
            duration: 600,
            queue: false
          });
        }
      },
      vector: function(pic) {
        var before, now, _ref;
        _ref = [($(pic)).data('position.before'), ($(pic)).position()], before = _ref[0], now = _ref[1];
        return {
          x: now.left - before.left,
          y: now.top - before.top
        };
      },
      friction: function(pic) {
        var damp, r, vector, _ref;
        _ref = [this.vector(pic), 500], vector = _ref[0], damp = _ref[1];
        r = ($(pic)).data('rotation') + (30 * vector.x / damp) + (15 * vector.y / damp);
        r = r > 0 ? Math.min(r, PIC.rotation) : Math.max(r, -PIC.rotation);
        ($(pic)).data('rotation', r);
        return {
          rotate: r + 'deg'
        };
      },
      toss: function(pic) {
        var damp, vector, _ref;
        _ref = [this.vector(pic), 2], vector = _ref[0], damp = _ref[1];
        ($(pic)).css({
          leftToss: 0,
          topToss: 0
        }).data({
          left: {
            original: U.float(($(pic)).css('left')),
            toss: vector.x / damp,
            before: 0,
            bounce: 1
          },
          top: {
            original: U.float(($(pic)).css('top')),
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
        var below, _i, _len, _ref, _results;
        _ref = PIC.stack.get('below', pic);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          below = _ref[_i];
          below = $(below);
          _results.push(below.data({
            rotation: below.data('rotation') + (PIC.rotation * U.rand())
          }).animate({
            rotate: below.data('rotation')
          }, {
            duration: 500,
            queue: false
          }));
        }
        return _results;
      }
    },
    events: {
      dblclick: function() {
        PIC.stack.clear(this);
        return ($(this)).rotate3Di('toggle', 700, {
          sideChange: __bind(function() {
            return ($(this)).toggleClass('flipped');
          }, this)
        });
      },
      load: function() {
        var pic;
        pic = ($(this)).parents('.pic');
        pic.add(pic.find('.backside')).css({
          height: ($(this)).outerHeight(),
          width: ($(this)).outerWidth()
        }).end().data({
          rotation: PIC.rotation * U.rand(),
          scale: 1 + .5 * U.rand()
        }).transform({
          rotate: pic.data('rotation') + 'deg',
          scale: U.xy(1.35)
        }).animate({
          scale: [U.xy(pic.data('scale'))]
        }, 600);
        PIC.place.arrange(pic, PIC.count++);
        PIC.events.drag.setup();
        return PIC.events.trash.setup();
      },
      drag: {
        start: function() {
          PIC.stack.clear(this);
          return ($(this)).animate({
            scale: [U.xy(1.5)]
          }, 300).data('position.before', ($(this)).position());
        },
        "while": function() {
          PIC.events.drag.whiles[0].call(this);
          return PIC.events.drag.whiles[1].call(this);
        },
        whiles: [
          _.throttle(function() {
            if ($('.ui-draggable-dragging').length > 0) {
              ($(this)).animate(PIC.physics.friction(this), {
                duration: 200,
                queue: false
              });
              return PIC.physics.dangle.start(this);
            }
          }, 250), _.throttle(function() {
            return ($(this)).data('position.before', ($(this)).position());
          }, 500)
        ],
        stop: function() {
          PIC.physics.dangle.stop(this);
          ($(this)).animate($.extend({
            scale: [U.xy(($(this)).data('scale'))]
          }, PIC.physics.toss(this), PIC.physics.friction(this)), {
            duration: 1000,
            step: PIC.events.step
          });
          return _.delay(PIC.physics.shuffle, 500, this);
        },
        setup: function() {
          return ($('#canvas .pic')).draggable({
            containment: 'parent',
            start: this.start,
            drag: this["while"],
            stop: this.stop
          });
        }
      },
      trash: {
        "delete": function(event, ui) {
          ($(ui.draggable)).fadeOut();
          return ($('#trash')).addClass('full');
        },
        restore: function() {
          ($('#canvas .pic:hidden')).fadeIn();
          return ($('#trash')).removeClass('full');
        },
        setup: function() {
          return ($('#trash')).droppable({
            accept: '.pic',
            hoverClass: 'hover',
            tolerance: 'touch',
            drop: this["delete"]
          }).click(this.restore);
        }
      },
      step: function(now, fx) {
        var hw, lt, param, pic, prop, quanta, _ref;
        if ((_ref = fx.prop) === 'leftToss' || _ref === 'topToss') {
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
      }
    },
    display: function(data) {
      var e, item, _i, _len, _ref;
      ($('#toolbar input')).val(data.photoset.ownername + "'s Shoebox");
      _ref = [
        data.photoset.photo.sort(function() {
          return U.rand();
        }).slice(0, PIC.total), PIC.events
      ], data = _ref[0], e = _ref[1];
      ($('#shoebox')).find('.loading').remove();
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        ($('#canvas')).append($('<div class="pic" />').html('<img src="' + item.url_s + '" /><div class="backside"><span>' + item.title + '</span></div>')).find('.pic:last').css('z-index', PIC.stack.topmost());
      }
      return ($('#canvas .pic')).dblclick(e.dblclick).click(e.click).find('img').load(e.load);
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
        return (_(points)).max() - (_(points)).min() <= this.length(l1) + this.length(l2);
      },
      draw: function(a, b) {
        var c;
        c = ($('#overlay'))[0].getContext('2d');
        c.moveTo(a.x || a.left, a.y || a.top);
        c.lineTo(b.x || b.left, b.y || b.top);
        c.lineWidth = 5;
        c.strokeStyle = 'red';
        return c.stroke();
      }
    },
    rect: {
      extract: function(o) {
        var height, left, top, width, _ref;
        o = $(o);
        _ref = [U.float(o.css('left')), o.outerWidth(), o.outerHeight(), U.float(o.css('top'))], left = _ref[0], width = _ref[1], height = _ref[2], top = _ref[3];
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
        var _ref;
        _ref = [this.extract(rect1), this.extract(rect2)], rect1 = _ref[0], rect2 = _ref[1];
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
        console.log(text, o ? U.print(o) : void 0);
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
    ($('#shoebox img.background')).css({
      height: $(window).height()
    });
    ($('#canvas')).css({
      height: $(window).height() - $('#shoebox #toolbar').height(),
      top: $('#shoebox #toolbar').height()
    });
    ($('#shoebox')).css('padding-top', ($(window)).height());
    return ($('#overlay')).attr({
      width: ($('#canvas')).width(),
      height: ($('#canvas')).height()
    });
  });
}).call(this);
