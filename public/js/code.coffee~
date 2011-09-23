window.PIC = PIC =
  total:8
  count:0
  size:1
  css:
    rotation:45
    scale:.75
  sets:
    abstract:'72157625438391339'
    obama:'72157626767345322'
    models:'72157606203394154'
    sexy:'72157607176703404'
    family5:'72157626228862861'
    family4:'72157610172574733'
    family3:'72157625806894425'
    family2:'72157594183166324'
    family1:'72157594172843597'
    faces:'72157605579131380'
    inventors:'72157605338975676'
    bw:'72157607708666180'
    objects:'72057594050733003'
    portman:'1476952'

(_ PIC).extend(
  pile:
    size:1
    positions:[
      [ {x:.5, y:.5} ]
      [ {x:.2, y:.4}, {x:.8, y:.4} ]
      [ {x:.25, y:.4}, {x:.75, y:.25}, {x:.6, y:.75} ]
      [ {x:.25, y:.25}, {x:.25, y:.75}, {x:.75, y:.25}, {x:.75, y:.75} ]
      [ {x:.2, y:.2}, {x:.2, y:.75}, {x:.5, y:.5} , {x:.75, y:.2}, {x:.75, y:.75} ]
    ]
    position:
      relative: (i)->
        index = if PIC.pile.size == 1
              0
          else
            if (_ i).isString()
              (_ DATA.locations.present).indexOf i
            else
              Math.floor i/(PIC.total/PIC.pile.size)
        PIC.pile.positions[ PIC.pile.size - 1 ][ index ]
      concrete: (count) ->
        relative = @relative count
        cage = x:($ '#canvas').width(), y:($ '#canvas').height()
        concrete = U.point.multiply cage, relative
        [ cage, concrete ]
    place: (pic, count) ->
      [cage, concrete] = PIC.pile.position.concrete count
      [radius, spread] = [{x:200, y:200}, if PIC.pile.size is 1 then {x:2, y:2} else {x:1, y:0}]
      offset = U.point.multiply( radius, {x:U.rand(), y:U.rand()}, spread )
      left: U.fit( 0, concrete.x + offset.x - $(pic).outerWidth()/2, cage.x )
      top: U.fit( 0, concrete.y + offset.y - $(pic).outerHeight()/2, cage.y )

  stack:
    topmost: -> _( ~~($ pic).css('z-index') for pic in ($ '#pics .pic') ).max() + 1
    index: (obj)-> $(obj).css('z-index')||0
    get: (atopBelow, from)->
      flip = {atop:1, below:-1}[atopBelow]
      pic for pic in ($ '#pics .pic').removeClass('topStack') when flip*@index(from) < flip*@index(pic) and U.rect.intersect from, pic
    _clear: (stack, from)->
      [flip, delta, from] = [{'-=':'+=', '+=':'-='}, '75px', ($ from)]
      for pic in stack
        left = if U.float(($ pic).css 'left') < U.float(from.css 'left') then '-=' else '+='
        top = if U.float(($ pic).css 'top') < U.float(from.css 'top') then '-=' else '+='
        ($ pic).animate(left:left+delta, top:top+delta, 400).
          animate left:flip[left]+delta, top:flip[top]+delta, 400
    clear: (from)->
      @_clear (@get 'atop', from), from
      _.delay (=> ($ from).css 'z-index', @topmost()), 300

  physics: # PHYSICS ---------------------------------------------------
    dangle:
      start: (pic)->
        @stop pic
        @_dangle pic
        _.delay (=> ($ pic).data 'dangle', window.setInterval => @_dangle pic, 500), 500
      stop: (pic) ->
        clearInterval ($ pic).data 'dangle'
      _dangle: (pic)->
        if $('.ui-draggable-dragging').length > 0
          r = ($ pic).data('rotation')/(1.5+U.rand()) * -1
          if Math.abs(r) < 3
            r = 0
            @stop pic
          ($ pic).data('rotation', r).
            imgAnimate rotate: r+'deg', {duration:500, queue:false}
        else
          @stop pic
    vector: (pic)->
      [before, now] = [($ pic).data('position.before'), ($ pic).position()]
      x: now.left-before.left, y: now.top-before.top
    friction: (pic)->
      [vector, damp] = [(@vector pic), 500]
      r = ($ pic).data('rotation')+(30*vector.x/damp)+(15*vector.y/damp)
      r = U.fit -PIC.css.rotation, r, PIC.css.rotation
      ($ pic).data 'rotation', r
      rotate: r+'deg'
    toss: (pic)->
      [vector, damp] = [(@vector pic), 2]
      ($ pic).css(leftToss:0, topToss:0).data
        left:
          original: U.float ($ pic).css 'left'
          toss: vector.x/damp
          before: 0
          bounce: 1
        top:
          original: U.float ($ pic).css 'top'
          toss: vector.y/damp
          before: 0
          bounce: 1
      leftToss:100, topToss:100
    shuffle: (pic)->
      for below in PIC.stack.get('below', pic)
        below = $ below
        below.data( rotation:below.data('rotation')+(PIC.css.rotation*U.rand()) ).
          imgAnimate rotate:below.data('rotation'), {duration:500, queue:false}

  events: # EVENTS ---------------------------------------------------
    dblclick: ->
      PIC.stack.clear @
      ($ @).rotate3Di 'toggle', 700, sideChange: =>
        ($ @).toggleClass('flipped')
        if ($ @).hasClass 'flipped'
          ($ @).find('.backside').animate(scale:[U.xy BOX.scale() * ($ @).data('scale')], 300)
    load: ->
      pic = ($ @).parents '.pic'
      pic.css(visibility:'visible').
        add( pic.find('.backside') ).css( height: ($ @).outerHeight(), width:($ @).outerWidth() ).end().
        data( rotation:PIC.css.rotation*U.rand(), scale: (PIC.css.scale+0.25*U.rand()) ).
        imgAnimate(scale:[U.xy BOX.scale() * pic.data('scale') * 1.2], 600)
      pic.find('img').transform(rotate:pic.data('rotation')+'deg', scale:U.xy BOX.scale() * pic.data('scale'))
      pic.css( PIC.pile.place pic, PIC.count++ )
      PIC.events.drag.setup()
    drag:
      start: ->
        PIC.stack.clear @
        ($ @).imgAnimate(scale:[U.xy BOX.scale() * ($ @).data('scale') * 1.2], 300).
          data 'position.before', ($ @).position()
      while: ->
        PIC.events.drag.whiles[0].call @
        PIC.events.drag.whiles[1].call @
      whiles: [
        _.throttle( ->
          if $('.ui-draggable-dragging').length > 0
            ($ @).imgAnimate PIC.physics.friction(@), duration:200, queue:false
            PIC.physics.dangle.start(@)
        , 250),
        _.throttle( ->
          #U.line.draw(($ @).data('position.before'), ($ @).position())
          ($ @).data 'position.before', ($ @).position()
        , 500)
      ]
      stop: ->
        PIC.physics.dangle.stop @
        unless ($ @).hasClass 'removed'
          ($ @).animate( PIC.physics.toss(@), duration:1000, step:PIC.events.step ).
            imgAnimate( $.extend( {scale: [U.xy BOX.scale()*($ @).data 'scale']}, PIC.physics.friction(@)) , duration:1000, queue:false)
          _.delay PIC.physics.shuffle, 500, @
      setup: ->
        ($ '#pics .pic').draggable
          containment: 'parent'
          start: @start
          drag: @while
          stop: @stop
    trash:
      delete: (event, ui)->
        ($ ui.draggable).addClass('removed').fadeOut()
        ($ '#trash').addClass('full')
      restore: ->
        ($ '#pics .pic:hidden').removeClass('removed').fadeIn()
        ($ '#trash').removeClass('full')
      setup: ->
        ($ '#trash').droppable(
          accept: '.pic'
          hoverClass: 'hover'
          tolerance: 'touch'
          drop: @delete
        ).click(@restore).hover( (->($ @).addClass 'nondrag-hover'), (->($ @).removeClass 'nondrag-hover') )
        
    step: (now, fx)->
      if fx.prop in ['leftToss', 'topToss']
        lt = if fx.prop is 'leftToss' then 'left' else 'top'
        pic = $(fx.elem)
        param = pic.data(lt)
        quanta = ((now - (param.before||0))/100) * param.toss

        param.before = now
        prop = U.float(pic.css(lt)) + ((param.bounce||1)*quanta)

        hw = if fx.prop is 'topToss' then 'height' else 'width'
        if (prop+pic[hw]() > $('#canvas')[hw]()-60) or prop < 0
          param.bounce = (param.bounce||1) * -1.5

        pic.css( lt, U.float(pic.css(lt)) + (param.bounce||1)*quanta )
        param = pic.data(lt, param)

  setup: (options={sort:false})->
    e = PIC.events
    ($ '#pics .pic').dblclick(e.dblclick).click(e.click).find('img').load(e.load)

  display: (pics)->
    ($ '#shoebox').find('.loading').remove()
    PIC.events.trash.setup()

    comment = (c)-> "<div class=\"comment\">#{c.comment}</div><div class=\"author\">#{c.author}</div>"
    (_ pics).each (pic, i)->
      ($ '#pics').append( DATA.pics[i].$html = $('<div class="pic" />').
        html('<img src="'+pic.url_s+'" /><div class="backside"><div class="text"></div></div>') ).
        find('.pic:last').css('z-index', PIC.stack.topmost()).find('.text').append( _(pic.comments).map(comment)...  )
    PIC.setup()
)

window.BOX = BOX =
  scale: (recalculate)->
    if not BOX.scale.saved? or recalculate?
      BOX.scale.saved = U.fit .75, $(window).width()*$(window).height() / 1.1e6, 2
    else
      BOX.scale.saved
  setup: ->
    @sort.setup()
    BOX.resize()
    ($ window).scroll -> ($ window).scrollTop(0).scrollLeft(0)
    ($ window).resize( BOX.resize )
  size: ->
    ($ '#shoebox .canvas-background').css height: $(window).height()
    ($ '#canvas' ).css height: $(window).height() - $('#shoebox #toolbar').height(), top:$('#shoebox #toolbar').height()
    ($ '#shoebox').css 'padding-top': ($ window).height()
    ($ '#overlay').attr width:($ '#canvas').width(), height:($ '#canvas').height()
    ($ '#pics').css width:($ '#canvas').width(), height:($ '#canvas').height()
    ($ '#chart').css
      width: ($ '#canvas').width()*.80
      height: ($ '#canvas').height()*.80
      top: ($ '#canvas').height()*.10
      left: ($ '#canvas').width()*.10
    ($ '.ear').cssMultiply(['width', 'height'], U.fit(1, BOX.scale()*.8, 1.5) ).
        find('img').cssMultiply(['margin-top', 'margin-bottom'], U.fit(1, BOX.scale()*1.5, 3)).
          cssMultiply ['margin-right', 'margin-left'], U.fit(1, BOX.scale()*1.1, 2)

  resize: ->
    BOX.size()
    BOX.scale(on)

    (_ $ '.pic').each (pic)->
      $(pic).imgAnimate(scale:[U.xy BOX.scale() * $(pic).data 'scale'], 600)
    
    BOX.title.setup()
    sort = ($ '#sorts a.selected').text().toLowerCase() or 'reset'
    BOX.sort.clear()
    BOX.sort[ sort ]()
    

  data:
    fetch: (set, size) ->
      PIC.total = size || PIC.total
      BOX.data.flickr.fetch set
    render: (flickr) ->
      BOX.title.setup flickr
      pics = BOX.data.mix flickr
      PIC.display pics
    mix: (data) ->
      pics = U.shuffle( data.photoset.photo ).slice(0, PIC.total)
      comments = U.shuffle( DATA.comments )
      pics = _(pics).map (pic, i)->
        c = U.shuffle([1,2,3,4])[0]
        pics[i] = _(pic).extend
          order: i
          comments: _(comments).first(c)
          date: U.shuffle(DATA.dates.all)[0]
          popularity: 5 + (5*U.rand())
          location: U.shuffle(DATA.locations.all)[0]
        comments = _(comments).rest(c)
        pics[i]
      DATA.pics = pics
    flickr:
      fetch:(set) ->
        set or= PIC.sets['family2']
        $.getJSON(
          #'/data?jsoncallback=?',
          "http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=a948a36e48c16afbf95a03c85418f417&photoset_id=#{set}&format=json&extras=url_s&jsoncallback=?",
          BOX.data.render
        )
            
  sort:
    setup: ->
      ($ '#sorts a').click(@click).each(-> ($ @).css 'width', ($ @).width())
    click: ->
      ($ '#sorts a').not(@).removeClass('selected')
      BOX.sort.clear()
      sort = ($ @).toggleClass('selected').text().toLowerCase()
      ($ '.pic.flipped:visible').dblclick()
      BOX.sort[ if ($ @).hasClass 'selected' then sort else 'reset' ]()
    reset: ->
      BOX.sort.reposition size:1, sort:'reset'
    clear: ->
      $('#canvas .location').remove()
      $('#chart').hide()
    location: ->
      grouped = (_ DATA.pics).groupBy (pic) -> pic.location
      DATA.locations.present = locations = (_ grouped).keys()
      BOX.sort.reposition size:locations.length, sort:'location'
      _.delay (-> (BOX.labels.place grouped, locations)), 600
    popularity: ->
      cage = BOX.tools.cage()
      pops = BOX.tools.popularity()

      (_ BOX.tools.visible DATA.pics ).map (pic)->
        pop = (pic.popularity - pops.min) / (pops.max - pops.min)
        relative = x: pop, y: pop
        concrete = U.point.multiply cage, relative
        pic.position =
          left: cage.left + U.fit 0, concrete.x - pic.$html.outerWidth(), cage.x
          top: cage.height - U.fit 50, concrete.y - pic.$html.outerHeight()/2, cage.height-50

      BOX.sort.reposition()
      $('#axis').html('').append(
        '<span>- LEAST Popular</span>',
        '<span style="left:auto; right:0">+ MOST Popular</span>')
    date: ->
      grouped = (_ DATA.pics).groupBy (pic) -> pic.date
      DATA.dates.present = dates = (_ grouped).keys().sort()
      $('#chart').fadeIn('slow')

      length = U.float(($ '#axis').width()) / U.float(dates.length)
      spans= (_ dates ).map (date, i)-> "<span style=\"left:#{length*(i+.3)}px\">#{date}</span>"
      $('#axis').html('').append( spans... )

      cage = BOX.tools.cage()
      (_ BOX.tools.visible DATA.pics ).map (pic, i, list)->
        group = grouped[pic.date]
        index = dates:_(dates).indexOf(pic.date+''), date: ( ((_ group).indexOf pic) + 1)/group.length
        offcenter = if index.date is 0 then 0 else index.date*(cage.height/5)*(1+(index.date%2)*-2)
        relative = x: index.dates/dates.length, y: .5
        concrete = U.point.multiply cage, relative
        pic.position =
          left: cage.left + U.fit 0, concrete.x, cage.x
          top: cage.height - (U.fit 0, concrete.y - pic.$html.outerHeight()/2 - offcenter, cage.height)

      BOX.sort.reposition()

    reposition: (options = {})->
      PIC.pile.size = options.size if options.size
      (_ BOX.tools.visible DATA.pics).each (pic, index, pics)->
        ###
        fixes =
          rotate:(pic.$html.data('rotation')/(if PIC.pile.size > 1 then 1.5 else 1))+'deg'
          scale:BOX.scale()*pic.$html.data('scale')/(if pics.length > 5 then 1.5 else 1)
        pic.$html.imgAnimate fixes, duration:300, queue:false
        ###
        position = if options.sort in ['location', 'reset'] then PIC.pile.place(pic.$html, pic.location) else pic.position
        pic.$html.animate position, 600

  tools:
    visible: (pics) ->
      _(pics).filter (pic)-> pic.$html.is(':visible')
    cage: ->
      (chart = $('#chart')).fadeIn('slow')
      x:chart.width(), y:chart.height(), left:chart.position().left, top:chart.position().top, height:chart.height()-$('#axis').height()-150
    popularity: ->
      all = (_ BOX.tools.visible DATA.pics ).chain().map( (pic)-> pic.popularity)
      all:all, max:all.max().value(), min:all.min().value()
  labels:
    findTop: (group)->
      _(group).chain().map((pic)-> pic.$html.position().top).
        reduce( ((memo, top)-> Math.min memo, top)).value()
    place: (grouped, locations)->
      (_ locations).each (location)->
        [limit, concrete] = PIC.pile.position.concrete location
        $html = $ '<div class="location">'+location+'</div>'
        $('#canvas').append $html
        top = BOX.labels.findTop grouped[location]
        $html.css
          left: U.fit 0, concrete.x - $html.outerWidth()/2, limit.x
          top: U.fit 0, top - (BOX.scale()*30) - $html.outerHeight(), limit.y

  title:
    setup:(data)->
      ta = ($ '#toolbar textarea')
      title = if data then (data.photoset.ownername) + "'s Shoebox" else ta.val()
      
      ta.val( title ).focus(-> ta.addClass 'focus').blur(-> ta.removeClass 'focus').
        keyup(@change).data
          width:
            max: $('#toolbar .container').width() - $('.logo-1000').width() - $('#sorts').width() - 400
            min: ta.width()
          height:
            min: ta.height()
      ($ '#toolbar .shadow').css 'max-width', ta.data('width').max
      $('#toolbar .title').css('visibility', 'visible').hover( (->($ @).addClass 'hover'), ->(($ @).removeClass 'hover'))
      @change.call ta
      @change.call ta #for some reason, initial height needs this double call (?)
    change:()->
      ta = $ @
      shadow = ($ '#toolbar .shadow').text ta.val()+' '
      padding = 2*U.float ta.css('padding-top')
      margin = 2*U.float ta.css('margin-top')
      ta.css
        width: U.fit ta.data('width').min, shadow.width()+50, ta.data('width').max
        height: U.fit ta.data('height').min, shadow.height(), 100
      ($ '#toolbar img.background').css
        width: ta.width()+padding+2
        height: ta.height()+padding+2
      ($ '#toolbar .title').css
        width: ta.width()+padding+margin+2
        height: ta.height()+padding+margin+2

window.U = U =
  point:
    multiply: (a, b...)->
      [b, rest] = [b[0], _(b).rest()]
      out = x: a.x*b.x, y: a.y*b.y
      if not _(rest).isEmpty()
        U.point.multiply out, rest...
      else
        out
  xy: (n)->[n,n]
  fit: (min, a, max)->
    Math.min max, Math.max min, a
  line:
    length: (l)-> Math.sqrt Math.pow(l[0].x-l[1].x,2) + Math.pow(l[0].y-l[1].y, 2)
    flatten: (l)-> if l[0].x is l[1].x then [l[0].y, l[1].y] else [l[0].x, l[1].x]
    intersect: (a, b)->
      points = _.union @flatten(a), @flatten(b)
      (_ points).max() - (_ points).min() <= @length(a) + @length(b)
    draw: (a, b)->
      c = ($ '#overlay')[0].getContext '2d'
      c.moveTo a.x||a.left, a.y||a.top
      c.lineTo b.x||b.left, b.y||b.top
      c.lineWidth = 5
      c.strokeStyle = 'red'
      c.stroke()
  rect:
    extract: (o)->
      o = $ o
      [left, width, height, top] = [(U.float o.css 'left'), o.outerWidth(), o.outerHeight(), (U.float o.css 'top')]
      a: {x:left, y:top}, b: {x:left+width, y:top}
      c: {x:left, y:top+height}, d: {x:left+width, y:top+height}
    intersect: (rect1, rect2)->
      [rect1, rect2] = [(@extract rect1), (@extract rect2)]
      U.line.intersect([rect1.a, rect1.b], [rect2.a, rect2.b]) and
        U.line.intersect([rect1.a, rect1.c], [rect2.a, rect2.c])
  rand: -> .5-Math.random()
  shuffle: (array) -> (array.sort -> U.rand() )
  float: (str)-> parseFloat str
  log: (text, o='') ->
    if o?
      console.log text+': ', U.print o
      o
    else
      console.log U.print text
      text
  print: (obj)->
    if not $.isPlainObject obj
      if (_ obj).isString() or (_ obj).isNumber() or (_ obj).isBoolean() or (_ obj).isDate() or (_ obj).isRegExp()
        obj+''
      else
        if (_ obj).isArray()
          '[ '+ (U.print el for el in obj).join(', ') + ' ]'
        else
          obj
    else
      '{ '+("#{key}:#{if $.isPlainObject value then U.print value else value}" for key, value of obj).join(', ')+' }'

$ ->
  BOX.setup()

$.fn.imgAnimate = (args...) ->
  this.find('img').animate args...
  return this
$.fn.cssMultiply = (attrs, multiple) ->
  (_ attrs).each (attr)=>
    this.data 'premultiply-'+attr, U.float( this.data('premultiply-'+attr) || this.css(attr))
    this.css( attr, this.data('premultiply-'+attr)* multiple )
  return this
