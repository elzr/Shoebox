/* DO NOT MODIFY. This file was compiled Sat, 17 Sep 2011 00:17:19 GMT from
 * /Users/sam/projects/sinatra/shoebox/public/js/code.coffee
 */

(function() {
  var BOX, PIC, U;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.PIC = PIC = {
    total: 12,
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
    pile: {
      size: 1,
      positions: [
        [
          {
            x: .5,
            y: .5
          }
        ], [
          {
            x: .25,
            y: .4
          }, {
            x: .75,
            y: .4
          }
        ], [
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
        ], [
          {
            x: .25,
            y: .25
          }, {
            x: .25,
            y: .75
          }, {
            x: .75,
            y: .25
          }, {
            x: .75,
            y: .75
          }
        ], [
          {
            x: .2,
            y: .2
          }, {
            x: .2,
            y: .75
          }, {
            x: .5,
            y: .5
          }, {
            x: .75,
            y: .2
          }, {
            x: .75,
            y: .75
          }
        ]
      ],
      position: function(i) {
        var pile;
        pile = PIC.pile;
        return pile.positions[pile.size - 1][Math.floor(i / (PIC.total / pile.size))];
      },
      place: function(pic, count, radius) {
        var limit, pile, spread;
        if (radius == null) {
          radius = 200;
        }
        limit = {
          x: ($('#canvas')).width(),
          y: ($('#canvas')).height()
        };
        pile = PIC.pile.position(count);
        pile = {
          x: limit.x * pile.x,
          y: limit.y * pile.y
        };
        spread = PIC.pile.size < 3 ? 2 : 1;
        return {
          left: Math.min(limit.x, Math.max(0, pile.x + (radius * U.rand()) * spread - pic.outerWidth() / 2)),
          top: Math.min(limit.y, Math.max(0, pile.y + (radius * U.rand()) * spread - pic.outerHeight() / 2))
        };
      }
    },
    stack: {
      topmost: function() {
        var pic;
        return _((function() {
          var _i, _len, _ref, _results;
          _ref = $('.pics .pic');
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
        _ref = ($('.pics .pic')).removeClass('topStack');
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
          return _.delay((__bind(function() {
            return ($(pic)).data('dangle', window.setInterval(__bind(function() {
              return this._dangle(pic, 500);
            }, this)));
          }, this)), 500);
        },
        stop: function(pic) {
          return clearInterval(($(pic)).data('dangle'));
        },
        _dangle: function(pic) {
          var r;
          if ($('.ui-draggable-dragging').length > 0) {
            r = (($(pic)).data('rotation')) / (1.5 + U.rand()) * -1;
            if (Math.abs(r) < 3) {
              r = 0;
              this.stop(pic);
            }
            ($(pic)).data('rotation', r);
            return ($(pic)).animate({
              rotate: r + 'deg'
            }, {
              duration: 500,
              queue: false
            });
          } else {
            return this.stop(pic);
          }
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
        }, 600).css(PIC.pile.place(pic, PIC.count++));
        return PIC.events.drag.setup();
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
          if (!($(this)).hasClass('removed')) {
            ($(this)).animate($.extend({
              scale: [U.xy(($(this)).data('scale'))]
            }, PIC.physics.toss(this), PIC.physics.friction(this)), {
              duration: 1000,
              step: PIC.events.step
            });
            return _.delay(PIC.physics.shuffle, 500, this);
          }
        },
        setup: function() {
          return ($('.pics .pic')).draggable({
            containment: 'parent',
            start: this.start,
            drag: this["while"],
            stop: this.stop
          });
        }
      },
      trash: {
        "delete": function(event, ui) {
          ($(ui.draggable)).addClass('removed').fadeOut();
          return ($('#trash')).addClass('full');
        },
        restore: function() {
          ($('.pics .pic:hidden')).removeClass('removed').fadeIn();
          return ($('#trash')).removeClass('full');
        },
        setup: function() {
          return ($('#trash')).droppable({
            accept: '.pic',
            hoverClass: 'hover',
            tolerance: 'touch',
            drop: this["delete"]
          }).click(this.restore).hover((function() {
            return ($(this)).addClass('nondrag-hover');
          }), (function() {
            return ($(this)).removeClass('nondrag-hover');
          }));
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
    setup: function(options) {
      var e;
      if (options == null) {
        options = {
          sort: false
        };
      }
      e = PIC.events;
      ($('.pics .pic')).dblclick(e.dblclick).click(e.click).find('img').load(e.load);
      if (options.sort) {
        return PIC.events.drag.setup();
      }
    },
    display: function(pics) {
      var pic, _i, _len;
      ($('#shoebox')).find('.loading').remove();
      PIC.events.trash.setup();
      for (_i = 0, _len = pics.length; _i < _len; _i++) {
        pic = pics[_i];
        ($('.pics')).append($('<div class="pic" data-id="' + pic.data_id + '" />').html('<img src="' + pic.url_s + '" /><div class="backside"><span>' + pic.title + '</span></div>')).find('.pic:last').css('z-index', PIC.stack.topmost());
      }
      return PIC.setup();
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
    shuffle: function(ary) {
      return ary.sort(function() {
        return U.rand();
      });
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
  window.BOX = BOX = {
    setup: function() {
      ($('#shoebox .canvas-background')).css({
        height: $(window).height()
      });
      ($('#canvas')).css({
        height: $(window).height() - $('#shoebox #toolbar').height(),
        top: $('#shoebox #toolbar').height()
      });
      ($('#shoebox')).css('padding-top', ($(window)).height());
      ($('#overlay')).attr({
        width: ($('#canvas')).width(),
        height: ($('#canvas')).height()
      });
      ($('.pics')).css({
        width: ($('#canvas')).width(),
        height: ($('#canvas')).height()
      });
      return this.sort.setup();
    },
    data: {
      fetch: function(set, size) {
        PIC.total = size || PIC.total;
        return BOX.data.flickr.fetch(set);
      },
      render: function(data) {
        var comments, pics;
        BOX.title.setup(data);
        pics = U.shuffle(data.photoset.photo).slice(0, PIC.total);
        comments = U.shuffle(DATA.comments);
        pics = _(pics).map(function(pic, i) {
          var c;
          c = U.shuffle([1, 2, 3, 4])[0];
          pics[i] = _(pic).extend({
            data_id: i,
            comments: _(comments).first(c),
            date: U.shuffle(DATA.dates)[0],
            popularity: 5 + (5 * U.rand()),
            location: U.shuffle(DATA.locations)[0]
          });
          DATA.comments = _(comments).first(c);
          return pics[i];
        });
        DATA.pics = pics;
        return PIC.display(pics);
      },
      flickr: {
        fetch: function(set) {
          set || (set = PIC.sets['family2']);
          return $.getJSON("http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=a948a36e48c16afbf95a03c85418f417&photoset_id=" + set + "&format=json&extras=url_s&jsoncallback=?", BOX.data.render);
        }
      }
    },
    sort: {
      setup: function() {
        return ($('#sorts a')).click(this.click).each(function() {
          return ($(this)).css('width', ($(this)).width());
        });
      },
      click: function() {
        var sort;
        ($('#sorts a')).not(this).removeClass('selected');
        sort = ($(this)).toggleClass('selected').text().toLowerCase();
        return BOX.sort[($(this)).hasClass('selected') ? sort : 'reset']();
      },
      reset: function() {
        var _pics;
        _pics = $('.pics').clone();
        PIC.pile.size = 1;
        _(_pics.find('.pic')).each(function(pic, i) {
          return $(pic).css(PIC.pile.place($(pic), i));
        });
        return $('.pics').quicksand(_pics.find('.pic').get(), (function() {
          return PIC.setup({
            sort: true
          });
        }));
      },
      location: function() {
        var grouped, pics, _pics;
        pics = $('.pics .pic');
        grouped = (_(DATA.pics)).groupBy(function(pic) {
          return pic.location;
        });
        _pics = $('.pics').clone();
        PIC.pile.size = 4;
        _(_pics.find('.pic')).each(function(pic, i) {
          return $(pic).css(PIC.pile.place($(pic), i));
        });
        return $('.pics').quicksand(_pics.find('.pic').get(), {
          adjustHeight: false
        }, (function() {
          return PIC.setup({
            sort: true
          });
        }));
      }
    },
    title: {
      setup: function(data) {
        var ta, title;
        title = data.photoset.ownername + "'s Shoebox";
        ta = $('#toolbar textarea');
        ta.val(title).focus(function() {
          return ta.addClass('focus');
        }).blur(function() {
          return ta.removeClass('focus');
        }).keyup(this.change).data({
          width: {
            max: $('#toolbar .container').width() - $('.logo-1000').width() - $('#sorts').width() - 400,
            min: ta.width()
          },
          height: {
            min: ta.height()
          }
        });
        ($('#toolbar .shadow')).css('max-width', ta.data('width').max);
        $('#toolbar .title').css('visibility', 'visible').hover((function() {
          return ($(this)).addClass('hover');
        }), {
          adjustHeight: false
        }, function() {
          return ($(this)).removeClass('hover');
        });
        this.change.call(ta);
        return this.change.call(ta);
      },
      change: function() {
        var margin, padding, shadow, ta;
        ta = $(this);
        shadow = ($('#toolbar .shadow')).text(ta.val() + ' ');
        padding = 2 * U.float(ta.css('padding-top'));
        margin = 2 * U.float(ta.css('margin-top'));
        ta.css({
          width: Math.min(ta.data('width').max, Math.max(ta.data('width').min, shadow.width() + 50)),
          height: Math.min(100, Math.max(ta.data('height').min, shadow.height()))
        });
        ($('#toolbar img.background')).css({
          width: ta.width() + padding + 2,
          height: ta.height() + padding + 2
        });
        return ($('#toolbar .title')).css({
          width: ta.width() + padding + margin + 2,
          height: ta.height() + padding + margin + 2
        });
      }
    }
  };
  $(function() {
    return BOX.setup();
  });
}).call(this);
