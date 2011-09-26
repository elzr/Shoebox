/* DO NOT MODIFY. This file was compiled Mon, 26 Sep 2011 19:04:15 GMT from
 * /Dropbox/prjcts/sinatra/shoebox/public/js/code.coffee
 */

(function() {
  var BOX, PIC, U;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  window.PIC = PIC = {
    total: 8,
    count: 0,
    size: 1,
    css: {
      rotation: 45,
      scale: .75
    },
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
            x: .2,
            y: .4
          }, {
            x: .8,
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
      position: {
        relative: function(i) {
          var index;
          index = PIC.pile.size === 1 ? 0 : (_(i)).isString() ? (_(DATA.locations.present)).indexOf(i) : Math.floor(i / (PIC.total / PIC.pile.size));
          return PIC.pile.positions[PIC.pile.size - 1][index];
        },
        concrete: function(count) {
          var cage, concrete, relative;
          relative = this.relative(count);
          cage = {
            x: ($('#canvas')).width(),
            y: ($('#canvas')).height()
          };
          concrete = U.point.multiply(cage, relative);
          return [cage, concrete];
        }
      },
      place: function(pic, count) {
        var cage, concrete, offset, radius, spread, _ref, _ref2;
        _ref = PIC.pile.position.concrete(count), cage = _ref[0], concrete = _ref[1];
        _ref2 = [
          {
            x: 200,
            y: 200
          }, PIC.pile.size === 1 ? {
            x: 2,
            y: 2
          } : {
            x: 1,
            y: 0
          }
        ], radius = _ref2[0], spread = _ref2[1];
        offset = U.point.multiply(radius, {
          x: U.rand(),
          y: U.rand()
        }, spread);
        return {
          left: U.fit(0, concrete.x + offset.x - $(pic).outerWidth() / 2, cage.x),
          top: U.fit(0, concrete.y + offset.y - $(pic).outerHeight() / 2, cage.y)
        };
      }
    },
    stack: {
      topmost: function() {
        var pic;
        return _((function() {
          var _i, _len, _ref, _results;
          _ref = $('#pics .pic');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            pic = _ref[_i];
            _results.push(~~($(pic)).css('z-index'));
          }
          return _results;
        })()).max() + 1;
      },
      index: function(obj) {
        return ~~$(obj).css('z-index') || 0;
      },
      get: function(atopBelow, from, pics) {
        var flip, fromRect, pic, _i, _len, _results;
        flip = {
          atop: 1,
          below: -1
        }[atopBelow];
        if (pics == null) {
          pics = $('#pics .pic').removeClass('topStack');
        }
        fromRect = $(from).hasClass('pic') ? $(from).find('img') : $(from);
        _results = [];
        for (_i = 0, _len = pics.length; _i < _len; _i++) {
          pic = pics[_i];
          if (flip * this.index(from) < flip * this.index(pic) && U.rect.intersect(fromRect, $(pic).find('img'))) {
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
            r = ($(pic)).data('rotation') / (1.5 + U.rand()) * -1;
            if (Math.abs(r) < 3) {
              r = 0;
              this.stop(pic);
            }
            return ($(pic)).data('rotation', r).imgAnimate({
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
        r = U.fit(-PIC.css.rotation, r, PIC.css.rotation);
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
            rotation: below.data('rotation') + (PIC.css.rotation * U.rand())
          }).imgAnimate({
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
            ($(this)).toggleClass('flipped');
            if (($(this)).hasClass('flipped')) {
              return ($(this)).find('.backside').animate({
                scale: [U.xy(BOX.scale() * ($(this)).data('scale'))]
              }, 300).jScrollPane();
            }
          }, this)
        });
      },
      load: function() {
        var pic;
        pic = ($(this)).parents('.pic');
        pic.css({
          visibility: 'visible'
        }).add(pic.find('.backside')).css({
          height: ($(this)).outerHeight(),
          width: ($(this)).outerWidth()
        }).end().data({
          rotation: PIC.css.rotation * U.rand(),
          scale: PIC.css.scale + 0.25 * U.rand()
        }).find('img').transform({
          rotate: pic.data('rotation') + 'deg',
          scale: U.xy(BOX.scale() * pic.data('scale') * 1.4)
        });
        pic.imgAnimate({
          scale: [U.xy(BOX.scale() * pic.data('scale'))]
        }, 600);
        pic.css(PIC.pile.place(pic, PIC.count++));
        return PIC.events.drag.setup();
      },
      drag: {
        start: function() {
          PIC.stack.clear(this);
          return ($(this)).imgAnimate({
            scale: [U.xy(BOX.scale() * ($(this)).data('scale') * 1.2)]
          }, 300).data('position.before', ($(this)).position());
        },
        "while": function() {
          PIC.events.drag.whiles[0].call(this);
          return PIC.events.drag.whiles[1].call(this);
        },
        whiles: [
          _.throttle(function() {
            if ($('.ui-draggable-dragging').length > 0) {
              ($(this)).imgAnimate(PIC.physics.friction(this), {
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
            ($(this)).animate(PIC.physics.toss(this), {
              duration: 1000,
              step: PIC.events.step
            }).imgAnimate($.extend({
              scale: [U.xy(BOX.scale() * ($(this)).data('scale'))]
            }, PIC.physics.friction(this)), {
              duration: 1000,
              queue: false
            });
            return _.delay(PIC.physics.shuffle, 500, this);
          }
        },
        setup: function() {
          return ($('#pics .pic')).draggable({
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
          ($('#pics .pic:hidden')).removeClass('removed').fadeIn();
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
      return ($('#pics .pic')).dblclick(e.dblclick).click(e.click).find('img').load(e.load);
    },
    display: function(pics) {
      var comment;
      ($('#shoebox')).find('.loading').remove();
      PIC.events.trash.setup();
      comment = function(c) {
        return "<div class=\"comment\">" + c.comment + "</div><div class=\"author\">" + c.author + "</div>";
      };
      (_(pics)).each(function(pic, i) {
        var _ref;
        return (_ref = ($('#pics')).append(DATA.pics[i].$html = $('<div class="pic" />').html('<img src="' + pic.url_s + '" /><div class="backside"><div class="text"></div></div>')).find('.pic:last').css('z-index', PIC.stack.topmost()).find('.text')).append.apply(_ref, _(pic.comments).map(comment));
      });
      return PIC.setup();
    }
  });
  window.BOX = BOX = {
    scale: function(recalculate) {
      if (!(BOX.scale.saved != null) || (recalculate != null)) {
        return BOX.scale.saved = U.fit(.75, $(window).width() * $(window).height() / 1.1e6, 2);
      } else {
        return BOX.scale.saved;
      }
    },
    setup: function() {
      this.sort.setup();
      BOX.resize();
      ($(window)).scroll(function() {
        return ($(window)).scrollTop(0).scrollLeft(0);
      });
      return ($(window)).resize(_.debounce(BOX.resize, 500));
    },
    size: function() {
      ($('#shoebox .canvas-background')).css({
        height: $(window).height()
      });
      ($('#canvas')).css({
        height: $(window).height() - $('#shoebox #toolbar').height(),
        top: $('#shoebox #toolbar').height()
      });
      ($('#shoebox')).css({
        'padding-top': ($(window)).height()
      });
      ($('#overlay')).attr({
        width: ($('#canvas')).width(),
        height: ($('#canvas')).height()
      });
      ($('#pics')).css({
        width: ($('#canvas')).width(),
        height: ($('#canvas')).height()
      });
      ($('#chart')).css({
        width: ($('#canvas')).width() * .80,
        height: ($('#canvas')).height() * .80,
        top: ($('#canvas')).height() * .10,
        left: ($('#canvas')).width() * .10
      });
      return ($('.ear')).cssMultiply(['width', 'height'], U.fit(1, BOX.scale() * .8, 1.5)).find('img').cssMultiply(['margin-top', 'margin-bottom'], U.fit(1, BOX.scale() * 1.5, 3)).cssMultiply(['margin-right', 'margin-left'], U.fit(1, BOX.scale() * 1.1, 2));
    },
    resize: function() {
      var sort;
      BOX.size();
      BOX.scale(true);
      (_($('.pic'))).each(function(pic) {
        return $(pic).imgAnimate({
          scale: [U.xy(BOX.scale() * $(pic).data('scale'))]
        }, 600);
      });
      BOX.title.setup();
      sort = ($('#sorts a.selected')).text().toLowerCase() || 'reset';
      BOX.sort.clear();
      return BOX.sort[sort]();
    },
    data: {
      fetch: function(set, size) {
        PIC.total = size || PIC.total;
        return BOX.data.flickr.fetch(set);
      },
      render: function(flickr) {
        var pics;
        BOX.title.setup(flickr);
        pics = BOX.data.mix(flickr);
        return PIC.display(pics);
      },
      mix: function(data) {
        var comments, pics;
        pics = U.shuffle(data.photoset.photo).slice(0, PIC.total);
        comments = U.shuffle(DATA.comments);
        pics = _(pics).map(function(pic, i) {
          var c;
          c = U.shuffle([1, 2, 3, 4])[0];
          pics[i] = _(pic).extend({
            order: i,
            comments: _(comments).first(c),
            date: U.shuffle(DATA.dates.all)[0],
            popularity: 5 + (5 * U.rand()),
            location: U.shuffle(DATA.locations.all)[0]
          });
          comments = _(comments).rest(c);
          return pics[i];
        });
        return DATA.pics = pics;
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
        BOX.sort.clear();
        sort = ($(this)).toggleClass('selected').text().toLowerCase();
        ($('.pic.flipped:visible')).dblclick();
        return BOX.sort[($(this)).hasClass('selected') ? sort : 'reset']();
      },
      reset: function() {
        return BOX.sort.reposition({
          size: 1,
          sort: 'reset'
        });
      },
      clear: function() {
        $('#canvas .location').remove();
        return $('#chart').hide();
      },
      location: function() {
        var grouped, locations;
        grouped = (_(DATA.pics)).groupBy(function(pic) {
          return pic.location;
        });
        DATA.locations.present = locations = (_(grouped)).keys();
        this.reposition({
          size: locations.length,
          sort: 'location'
        });
        return _.delay((__bind(function() {
          return this.label.location(grouped, locations);
        }, this)), 600);
      },
      popularity: function() {
        var cage, pops;
        cage = this.get.cage();
        pops = this.get.popularity();
        (_(this.get.visible(DATA.pics))).map(function(pic) {
          var concrete, pop, relative;
          pop = (pic.popularity - pops.min) / (pops.max - pops.min);
          relative = {
            x: pop,
            y: pop
          };
          concrete = U.point.multiply(cage, relative);
          return pic.position = {
            left: cage.left + U.fit(0, concrete.x - pic.$html.outerWidth(), cage.x),
            top: cage.height - U.fit(50, concrete.y - pic.$html.outerHeight() / 2, cage.height - 50)
          };
        });
        this.reposition();
        return this.label.popularity;
      },
      date: function() {
        var cage, dates, grouped;
        grouped = (_(DATA.pics)).groupBy(function(pic) {
          return pic.date;
        });
        DATA.dates.present = dates = (_(grouped)).keys().sort();
        this.label.date(dates);
        cage = this.get.cage();
        (_(this.get.visible(DATA.pics))).map(function(pic, i, list) {
          var concrete, group, index, offcenter, relative;
          group = grouped[pic.date];
          index = {
            dates: _(dates).indexOf(pic.date + ''),
            date: (((_(group)).indexOf(pic)) + 1) / group.length
          };
          offcenter = index.date === 0 ? 0 : index.date * (cage.height / 5) * (1 + (index.date % 2) * -2);
          relative = {
            x: index.dates / dates.length,
            y: .5
          };
          concrete = U.point.multiply(cage, relative);
          return pic.position = {
            left: cage.left + U.fit(0, concrete.x, cage.x),
            top: cage.height - (U.fit(0, concrete.y - pic.$html.outerHeight() / 2 - offcenter, cage.height))
          };
        });
        return this.reposition();
      },
      reposition: function(options) {
        if (options == null) {
          options = {};
        }
        if (options.size) {
          PIC.pile.size = options.size;
        }
        return (_(this.get.visible(DATA.pics))).each(function(pic, index, pics) {
          /*
                  fixes =
                    rotate:(pic.$html.data('rotation')/(if PIC.pile.size > 1 then 1.5 else 1))+'deg'
                    scale:BOX.scale()*pic.$html.data('scale')/(if pics.length > 5 then 1.5 else 1)
                  pic.$html.imgAnimate fixes, duration:300, queue:false
                  */
          var position, _ref;
          position = (_ref = options.sort) === 'location' || _ref === 'reset' ? PIC.pile.place(pic.$html, pic.location) : pic.position;
          return pic.$html.animate(position, 600);
        });
      },
      label: {
        findTop: function(group) {
          return _(group).chain().map(function(pic) {
            return U.rect.extract(pic.$html.find('img')).tl.y;
          }).reduce((function(memo, top) {
            return Math.min(memo, top);
          })).value();
        },
        location: function(grouped, locations) {
          return (_(locations)).each(__bind(function(location) {
            var $label, concrete, group, limit, top, _ref;
            _ref = PIC.pile.position.concrete(location), limit = _ref[0], concrete = _ref[1];
            $label = $('<div class="location">' + location + '</div>').appendTo('#canvas');
            group = grouped[location];
            if (group.length > 0) {
              top = this.findTop(group);
              return $label.show().css({
                left: U.fit(0, concrete.x - $label.outerWidth() / 2, limit.x),
                top: U.fit(0, top - BOX.scale() * 20 - $label.outerHeight(), limit.y)
              });
            } else {
              return $label.hide();
            }
          }, this));
        },
        date: function(dates) {
          var length, spans, _ref;
          $('#chart').fadeIn('slow');
          length = U.float(($('#axis')).width()) / U.float(dates.length);
          spans = (_(dates)).map(function(date, i) {
            return "<span style=\"left:" + (length * (i + .3)) + "px\">" + date + "</span>";
          });
          return (_ref = $('#axis').html('')).append.apply(_ref, spans);
        },
        popularity: function() {
          $('#chart').fadeIn('slow');
          return $('#axis').html('').append('<span>- LEAST Popular</span>', '<span style="left:auto; right:0">+ MOST Popular</span>');
        }
      },
      get: {
        visible: function(pics) {
          return _(pics).filter(function(pic) {
            return pic.$html.is(':visible');
          });
        },
        cage: function() {
          var chart, out;
          (chart = $('#chart')).fadeIn('slow');
          return out = {
            x: chart.width(),
            y: chart.height(),
            left: chart.position().left,
            top: chart.position().top,
            height: chart.height() - $('#axis').height() - 150
          };
        },
        popularity: function() {
          var all;
          all = (_(this.visible(DATA.pics))).chain().map(function(pic) {
            return pic.popularity;
          });
          return {
            all: all,
            max: all.max().value(),
            min: all.min().value()
          };
        }
      }
    },
    title: {
      setup: function(data) {
        var ta, title;
        ta = $('#toolbar textarea');
        title = data ? data.photoset.ownername + "'s Shoebox" : ta.val();
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
        }), function() {
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
          width: U.fit(ta.data('width').min, shadow.width() + 50, ta.data('width').max),
          height: U.fit(ta.data('height').min, shadow.height(), 100)
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
  window.U = U = {
    point: {
      multiply: function() {
        var a, b, out, rest, _ref, _ref2;
        a = arguments[0], b = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        _ref = [b[0], _(b).rest()], b = _ref[0], rest = _ref[1];
        out = {
          x: a.x * b.x,
          y: a.y * b.y
        };
        if (!_(rest).isEmpty()) {
          return (_ref2 = U.point).multiply.apply(_ref2, [out].concat(__slice.call(rest)));
        } else {
          return out;
        }
      }
    },
    xy: function(n) {
      return [n, n];
    },
    fit: function(min, between, max) {
      return Math.min(max, Math.max(min, between));
    },
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
      intersect: function(a, b) {
        var points;
        points = _.union(this.flatten(a), this.flatten(b));
        return (_(points)).max() - (_(points)).min() <= this.length(a) + this.length(b);
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
        var height, left, parent, top, width, _ref, _ref2;
        o = $(o);
        parent = o.parents('#pics, #canvas').first();
        _ref = [o.offset().left - parent.offset().left, o.offset().top - parent.offset().top], left = _ref[0], top = _ref[1];
        _ref2 = [o.outerWidth(), o.outerHeight()], width = _ref2[0], height = _ref2[1];
        return {
          tl: {
            x: left,
            y: top
          },
          tr: {
            x: left + width,
            y: top
          },
          bl: {
            x: left,
            y: top + height
          },
          br: {
            x: left + width,
            y: top + height
          }
        };
      },
      draw: function(r, color) {
        if (color == null) {
          color = 'red';
        }
        return ($('<div class="rect"/>')).appendTo('#canvas').css({
          top: r.tl.y,
          left: r.tl.x,
          width: r.tr.x - r.tl.x,
          height: r.bl.y - r.tl.y,
          background: color
        });
      },
      intersect: function(a, b) {
        var out, _ref;
        _ref = [this.extract(a), this.extract(b)], a = _ref[0], b = _ref[1];
        return out = U.line.intersect([a.tl, a.tr], [b.tl, b.tr]) && U.line.intersect([a.tl, a.bl], [b.tl, b.bl]);
      }
    },
    rand: function() {
      return .5 - Math.random();
    },
    shuffle: function(array) {
      return array.sort(function() {
        return U.rand();
      });
    },
    float: function(str) {
      return parseFloat(str);
    },
    log: function(text, o) {
      if (o == null) {
        o = '';
      }
      if (o != null) {
        console.log(text + ': ', U.print(o));
        return o;
      } else {
        console.log(U.print(text));
        return text;
      }
    },
    print: function(obj) {
      var el, key, value;
      if (!$.isPlainObject(obj)) {
        if ((_(obj)).isString() || (_(obj)).isNumber() || (_(obj)).isBoolean() || (_(obj)).isDate() || (_(obj)).isRegExp()) {
          return obj + '';
        } else {
          if ((_(obj)).isArray()) {
            return '[ ' + ((function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = obj.length; _i < _len; _i++) {
                el = obj[_i];
                _results.push(U.print(el));
              }
              return _results;
            })()).join(', ') + ' ]';
          } else {
            return obj;
          }
        }
      } else {
        return '{ ' + ((function() {
          var _results;
          _results = [];
          for (key in obj) {
            value = obj[key];
            _results.push("" + key + ":" + ($.isPlainObject(value) ? U.print(value) : value));
          }
          return _results;
        })()).join(', ') + ' }';
      }
    }
  };
  $(function() {
    return BOX.setup();
  });
  $.fn.imgAnimate = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    (_ref = this.find('img')).animate.apply(_ref, args);
    return this;
  };
  $.fn.cssMultiply = function(attrs, multiple) {
    (_(attrs)).each(__bind(function(attr) {
      this.data('premultiply-' + attr, U.float(this.data('premultiply-' + attr) || this.css(attr)));
      return this.css(attr, this.data('premultiply-' + attr) * multiple);
    }, this));
    return this;
  };
}).call(this);
