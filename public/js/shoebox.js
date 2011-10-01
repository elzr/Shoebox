/* DO NOT MODIFY. This file was compiled Fri, 30 Sep 2011 20:11:49 GMT from
 * /Dropbox/prjcts/sinatra/shoebox/public/js/shoebox.coffee
 */

(function() {
  var BOX, H, PIC;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  window.BOX = BOX = {
    setup: function() {
      this.sort.setup();
      BOX.resize();
      ($(window)).resize(_.debounce(BOX.resize, 500));
      return ($(window)).scroll(function() {
        return ($(window)).scrollTop(0).scrollLeft(0);
      });
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
      return ($('.ear')).cssMultiply(['width', 'height'], H.fit(1, BOX.scale() * .8, 1.5)).find('img').cssMultiply(['margin-top', 'margin-bottom'], H.fit(1, BOX.scale() * 1.5, 3)).cssMultiply(['margin-right', 'margin-left'], H.fit(1, BOX.scale() * 1.1, 2));
    },
    resize: function() {
      var sort;
      BOX.size();
      BOX.scale('recalculate');
      (_($('.pic'))).each(function(pic) {
        return $(pic).imgAnimate({
          scale: [H.xy(BOX.scale() * $(pic).data('scale'))]
        }, 600);
      });
      BOX.title.setup();
      sort = ($('#sorts a.selected')).text().toLowerCase() || 'reset';
      BOX.sort.clear();
      return BOX.sort[sort]();
    },
    goodBrowser: (!$.browser.msie) || ((!$.browser.msie) && $.browser.version >= 8),
    scale: function(recalculate) {
      if (!(BOX.scale.saved != null) || (recalculate != null)) {
        return BOX.scale.saved = H.fit(.75, $(window).width() * $(window).height() / 1.1e6, 2);
      } else {
        return BOX.scale.saved;
      }
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
        return PIC.display.setup(pics);
      },
      mix: function(data) {
        var comments, pics;
        pics = H.shuffle(data.photoset.photo).slice(0, PIC.total);
        comments = H.shuffle(DATA.comments);
        pics = _(pics).map(function(pic, i) {
          var c;
          c = H.shuffle([1, 2, 3, 4, 5])[0];
          pics[i] = _(pic).extend({
            order: i,
            comments: _(comments).first(c),
            date: H.shuffle(DATA.dates.all)[0],
            popularity: 5 + (5 * H.rand()),
            location: H.shuffle(DATA.locations.all)[0]
          });
          comments = _(comments).rest(c);
          return pics[i];
        });
        return DATA.pics = pics;
      },
      flickr: {
        fetch: function(set) {
          set || (set = PIC.sets['family']);
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
        var chart, pops;
        chart = this.get.chart();
        pops = this.get.popularity();
        (_(this.get.visible(DATA.pics))).map(function(pic) {
          var concrete, pop, relative;
          pop = (pic.popularity - pops.min) / (pops.max - pops.min);
          relative = {
            x: pop,
            y: pop
          };
          concrete = H.point.multiply(chart, relative);
          return pic.position = {
            left: chart.left + H.fit(0, concrete.x - pic.$html.outerWidth(), chart.x),
            top: chart.height - H.fit(50, concrete.y - pic.$html.outerHeight() / 2, chart.height - 50)
          };
        });
        this.reposition();
        return this.label.popularity;
      },
      date: function() {
        var chart, dates, grouped;
        grouped = (_(DATA.pics)).groupBy(function(pic) {
          return pic.date;
        });
        DATA.dates.present = dates = (_(grouped)).keys().sort();
        this.label.date(dates);
        chart = this.get.chart();
        (_(this.get.visible(DATA.pics))).map(function(pic, i, list) {
          var concrete, group, index, offcenter, relative;
          group = grouped[pic.date];
          index = {
            dates: _(dates).indexOf(pic.date + ''),
            date: (((_(group)).indexOf(pic)) + 1) / group.length
          };
          offcenter = index.date === 0 ? 0 : index.date * (chart.height / 5) * (1 + (index.date % 2) * -2);
          relative = {
            x: index.dates / dates.length,
            y: .5
          };
          concrete = H.point.multiply(chart, relative);
          return pic.position = {
            left: chart.left + H.fit(0, concrete.x, chart.x),
            top: chart.height - (H.fit(0, concrete.y - pic.$html.outerHeight() / 2 - offcenter, chart.height))
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
          var position, _ref;
          position = (_ref = options.sort) === 'location' || _ref === 'reset' ? PIC.pile.place(pic.$html, pic.location) : pic.position;
          return pic.$html.animate(position, 600);
        });
      },
      label: {
        findTop: function(group) {
          return _(group).chain().map(function(pic) {
            return H.rect.extract(pic.$html.find('img')).tl.y;
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
            if (BOX.sort.get.visible(group).length > 0) {
              top = this.findTop(group);
              return $label.show().css({
                left: H.fit(0, concrete.x - $label.outerWidth() / 2, limit.x),
                top: H.fit(0, top - BOX.scale() * 20 - $label.outerHeight(), limit.y)
              });
            } else {
              return $label.hide();
            }
          }, this));
        },
        date: function(dates) {
          var length, spans, _ref;
          $('#chart').fadeIn('slow');
          length = H.float(($('#axis')).width()) / H.float(dates.length);
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
        chart: function() {
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
        padding = 2 * H.float(ta.css('padding-top'));
        margin = 2 * H.float(ta.css('margin-top'));
        ta.css({
          width: H.fit(ta.data('width').min, shadow.width() + 50, ta.data('width').max),
          height: H.fit(ta.data('height').min, shadow.height(), 100)
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
  window.PIC = PIC = {
    total: 8,
    css: {
      rotation: 45,
      scale: .75
    },
    sets: {
      family: '72157594183166324'
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
        relative: function(count) {
          var index;
          index = PIC.pile.size === 1 ? 0 : (_(count)).isString() ? (_(DATA.locations.present)).indexOf(count) : Math.floor(count / PIC.total / PIC.pile.size);
          return PIC.pile.positions[PIC.pile.size - 1][index];
        },
        concrete: function(count) {
          var chart, concrete, relative;
          relative = this.relative(count);
          chart = {
            x: ($('#canvas')).width(),
            y: ($('#canvas')).height()
          };
          concrete = H.point.multiply(chart, relative);
          return [chart, concrete];
        }
      },
      place: function(pic, count) {
        var chart, concrete, offset, radius, _ref;
        _ref = PIC.pile.position.concrete(count), chart = _ref[0], concrete = _ref[1];
        radius = PIC.pile.size === 1 ? {
          x: 400,
          y: 400
        } : {
          x: 200,
          y: 0
        };
        offset = H.point.multiply(radius, {
          x: H.rand(),
          y: H.rand()
        });
        return {
          left: H.fit(0, concrete.x + offset.x - $(pic).outerWidth() / 2, chart.x),
          top: H.fit(0, concrete.y + offset.y - $(pic).outerHeight() / 2, chart.y)
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
            _results.push(this.index(pic));
          }
          return _results;
        }).call(this)).max() + 1;
      },
      index: function(obj) {
        return ~~$(obj).css('z-index');
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
          if (flip * this.index(from) < flip * this.index(pic) && H.rect.intersect(fromRect, $(pic).find('img'))) {
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
          left = H.float(($(pic)).css('left')) < H.float(from.css('left')) ? '-=' : '+=';
          top = H.float(($(pic)).css('top')) < H.float(from.css('top')) ? '-=' : '+=';
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
            r = ($(pic)).data('rotation') / (1.5 + H.rand()) * -1;
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
        r = H.fit(-PIC.css.rotation, r, PIC.css.rotation);
        ($(pic)).data('rotation', r);
        return {
          rotate: r + 'deg'
        };
      },
      toss: {
        setup: function(pic) {
          var damp, vector, _ref;
          _ref = [PIC.physics.vector(pic), 2], vector = _ref[0], damp = _ref[1];
          ($(pic)).css({
            leftToss: 0,
            topToss: 0
          }).data({
            left: {
              original: H.float(($(pic)).css('left')),
              toss: vector.x / damp,
              before: 0,
              bounce: 1
            },
            top: {
              original: H.float(($(pic)).css('top')),
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
        step: function(now, fx) {
          var hw, lt, param, pic, prop, quanta, _ref;
          if ((_ref = fx.prop) === 'leftToss' || _ref === 'topToss') {
            lt = fx.prop === 'leftToss' ? 'left' : 'top';
            pic = $(fx.elem);
            param = pic.data(lt);
            quanta = ((now - (param.before || 0)) / 100) * param.toss;
            param.before = now;
            prop = H.float(pic.css(lt)) + ((param.bounce || 1) * quanta);
            hw = fx.prop === 'topToss' ? 'height' : 'width';
            if ((prop + pic[hw]() > $('#canvas')[hw]() - 60) || prop < 0) {
              param.bounce = (param.bounce || 1) * -1.5;
            }
            pic.css(lt, H.float(pic.css(lt)) + (param.bounce || 1) * quanta);
            return param = pic.data(lt, param);
          }
        }
      },
      shuffle: function(pic) {
        var below, _i, _len, _ref, _results;
        _ref = PIC.stack.get('below', pic);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          below = _ref[_i];
          below = $(below);
          _results.push(below.data({
            rotation: below.data('rotation') + (PIC.css.rotation * H.rand())
          }).imgAnimate({
            rotate: below.data('rotation')
          }, {
            duration: 500,
            queue: false
          }));
        }
        return _results;
      },
      flip: {
        start: function(pic) {
          if (!BOX.goodBrowser) {
            return pic.toggleClass('flipped').find('.backside');
          } else {
            return pic.rotate3Di('toggle', 700, {
              sideChange: PIC.physics.flip.middle
            });
          }
        },
        middle: function() {
          var pic;
          pic = $(this);
          if (pic.toggleClass('flipped').hasClass('flipped')) {
            return pic.find('.backside').animate({
              scale: [H.xy(BOX.scale() * pic.data('scale'))]
            }, 300);
          }
        }
      }
    },
    events: {
      dblclick: function() {
        PIC.stack.clear(this);
        return PIC.physics.flip.start($(this));
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
          rotation: PIC.css.rotation * H.rand(),
          scale: PIC.css.scale + 0.25 * H.rand()
        }).find('img, .backside').transform({
          rotate: pic.data('rotation') + 'deg',
          scale: H.xy(BOX.scale() * pic.data('scale') * 1.4)
        });
        pic.imgAnimate({
          scale: [H.xy(BOX.scale() * pic.data('scale'))]
        }, 600);
        pic.css(PIC.pile.place(pic, PIC.count++));
        PIC.events.drag.setup();
        return PIC.display.paginate.setup(DATA.pics[pic.data('order')]);
      },
      drag: {
        start: function() {
          PIC.stack.clear(this);
          return ($(this)).imgAnimate({
            scale: [H.xy(BOX.scale() * ($(this)).data('scale') * 1.2)]
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
            ($(this)).animate(PIC.physics.toss.setup(this), {
              duration: 1000,
              step: PIC.physics.toss.step
            }).imgAnimate($.extend({
              scale: [H.xy(BOX.scale() * ($(this)).data('scale'))]
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
      setup: function() {
        var e;
        e = PIC.events;
        return ($('#pics .pic')).dblclick(e.dblclick).click(e.click).find('img').load(e.load);
      }
    },
    display: {
      setup: function(pics) {
        ($('#shoebox')).find('.loading').remove();
        PIC.events.trash.setup();
        (_(pics)).each(function(pic, i) {
          return ($('#pics')).append(DATA.pics[i].$html = $('<div class="pic" />').data({
            order: i
          }).html('<img src="' + pic.url_s + '" /><div class="backside"><div class="text"></div><div class="pages">&nbsp;</div></div>')).find('.pic:last').css('z-index', PIC.stack.topmost());
        });
        return PIC.events.setup();
      },
      paginate: {
        setup: function(pic) {
          var comments, grouped, _ref;
          comments = _(pic.comments).map(PIC.display.comment);
          this.text = pic.$html.find('.text');
          this.backside = pic.$html.find('.backside');
          this.pages = pic.$html.find('.pages');
          pic.comments.grouped = grouped = BOX.goodBrowser ? this.group(1, comments) : _(comments).map(function(c) {
            return [c];
          });
          (_ref = this.text.data('grouped', grouped).html('')).append.apply(_ref, grouped[0]);
          if (grouped.length > 1) {
            this.number(grouped);
          }
          if (!BOX.goodBrowser) {
            return this.backside.addClass('badBrowser');
          }
        },
        number: function(grouped) {
          var page, _ref;
          for (page = 1, _ref = grouped.length; 1 <= _ref ? page <= _ref : page >= _ref; 1 <= _ref ? page++ : page--) {
            this.pages.append('<a href="javascript:void(0)">' + page + '</a>');
          }
          this.pages.find('a').click(this.page).first().addClass('selected');
          return this.text.addClass('paged');
        },
        page: function() {
          var text, _ref;
          text = $(this).parents('.backside').find('.text');
          (_ref = text.html('')).append.apply(_ref, text.data('grouped')[H.float($(this).text()) - 1]);
          return $(this).siblings().removeClass('selected').end().addClass('selected');
        },
        group: function(perpage, comments, grouped) {
          var first, rest, _ref, _ref2, _ref3, _ref4;
          if (grouped == null) {
            grouped = [];
          }
          _ref = H.split(comments, perpage), first = _ref[0], rest = _ref[1];
          (_ref2 = this.text.html('')).append.apply(_ref2, first);
          if (rest.length > 0) {
            grouped = perpage === 1 || this.text.height() <= this.backside.height() ? this.group(perpage + 1, comments, grouped) : ((_ref3 = H.split(comments, perpage - 1), first = _ref3[0], rest = _ref3[1], _ref3), grouped[grouped.length] = first, this.group(1, rest, grouped));
          } else {
            if (perpage !== 1 && this.text.height() >= this.backside.height()) {
              _ref4 = H.split(comments, perpage - 1), grouped[grouped.length] = _ref4[0], grouped[grouped.length] = _ref4[1];
            } else {
              grouped[grouped.length] = comments;
            }
          }
          return grouped;
        }
      },
      comment: function(c) {
        return "<div class=\"comment\">" + c.comment + "</div><div class=\"author\">- " + c.author + "</div>";
      }
    }
  });
  window.H = H = {
    xy: function(n) {
      return [n, n];
    },
    fit: function(min, between, max) {
      return Math.min(max, Math.max(min, between));
    },
    split: function(array, split) {
      return [_(array).first(split), _(array).rest(split)];
    },
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
          return (_ref2 = H.point).multiply.apply(_ref2, [out].concat(__slice.call(rest)));
        } else {
          return out;
        }
      }
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
        return out = H.line.intersect([a.tl, a.tr], [b.tl, b.tr]) && H.line.intersect([a.tl, a.bl], [b.tl, b.bl]);
      }
    },
    rand: function() {
      return .5 - Math.random();
    },
    shuffle: function(array) {
      return array.sort(function() {
        return H.rand();
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
        console.log(text + ': ', H.print(o));
        return o;
      } else {
        console.log(H.print(text));
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
                _results.push(H.print(el));
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
            _results.push("" + key + ":" + ($.isPlainObject(value) ? H.print(value) : value));
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
    (_ref = this.find('img, .backside')).animate.apply(_ref, args);
    return this;
  };
  $.fn.cssMultiply = function(attrs, multiple) {
    (_(attrs)).each(__bind(function(attr) {
      this.data('premultiply-' + attr, H.float(this.data('premultiply-' + attr) || this.css(attr)));
      return this.css(attr, this.data('premultiply-' + attr) * multiple);
    }, this));
    return this;
  };
}).call(this);
