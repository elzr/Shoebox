window.PIC = PIC =
  total:12
  count:0
  rotation:60
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
      [ {x:.25, y:.4}, {x:.75, y:.4} ]
      [ {x:.25, y:.4}, {x:.75, y:.25}, {x:.6, y:.75} ]
      [ {x:.25, y:.25}, {x:.25, y:.75}, {x:.75, y:.25}, {x:.75, y:.75} ]
      [ {x:.2, y:.2}, {x:.2, y:.75}, {x:.5, y:.5} , {x:.75, y:.2}, {x:.75, y:.75} ]
    ]
    position: (i)->
      pile = PIC.pile
      pile.positions[ pile.size - 1 ][  Math.floor i/(PIC.total/pile.size) ]
    place: (pic, count, radius=200) ->
      limit = x:($ '#canvas').width(), y:($ '#canvas').height()
      pile = PIC.pile.position count # pile of relative values
      pile = x:limit.x*pile.x, y:limit.y*pile.y # pile of concrete values
      spread = if PIC.pile.size < 3 then 2 else 1

      left: Math.min limit.x, Math.max(0, pile.x+(radius*U.rand())*spread - pic.outerWidth()/2)
      top: Math.min limit.y, Math.max(0, pile.y+(radius*U.rand())*spread - pic.outerHeight()/2)

  stack:
    topmost: -> _( ~~($ pic).css('z-index') for pic in ($ '.pics .pic') ).max() + 1
    index: (obj)-> $(obj).css('z-index')||0
    get: (atopBelow, from)->
      flip = {atop:1, below:-1}[atopBelow]
      pic for pic in ($ '.pics .pic').removeClass('topStack') when flip*@index(from) < flip*@index(pic) and U.rect.intersect from, pic
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
          r = (($ pic).data 'rotation')/(1.5+U.rand()) * -1
          if Math.abs(r) < 3
            r = 0
            @stop pic
          ($ pic).data 'rotation', r
          ($ pic).animate rotate: r+'deg', {duration:500, queue:false}
        else
          @stop pic
    vector: (pic)->
      [before, now] = [($ pic).data('position.before'), ($ pic).position()]
      x: now.left-before.left, y: now.top-before.top
    friction: (pic)->
      [vector, damp] = [(@vector pic), 500]
      r = ($ pic).data('rotation')+(30*vector.x/damp)+(15*vector.y/damp)
      r = if r > 0 then Math.min r, PIC.rotation else Math.max r, -PIC.rotation
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
        below.data( rotation:below.data('rotation')+(PIC.rotation*U.rand()) ).
          animate rotate:below.data('rotation'), {duration:500, queue:false}

  events: # EVENTS ---------------------------------------------------
    dblclick: ->
      PIC.stack.clear @
      ($ @).rotate3Di 'toggle', 700, sideChange: => ($ @).toggleClass 'flipped'
    load: ->
      pic = ($ @).parents '.pic'
      pic.add( pic.find '.backside' ).css( height: ($ @).outerHeight(), width:($ @).outerWidth() ).end().
        data( rotation:PIC.rotation*U.rand(), scale: 1+.5*U.rand() ).
        transform(rotate:pic.data('rotation')+'deg', scale:U.xy 1.35).
        animate(scale:[U.xy pic.data 'scale'], 600).
        css( PIC.pile.place pic, PIC.count++ )
      PIC.events.drag.setup()
    drag:
      start: ->
        PIC.stack.clear @
        ($ @).animate(scale:[U.xy 1.5], 300).
          data 'position.before', ($ @).position()
      while: ->
        PIC.events.drag.whiles[0].call @
        PIC.events.drag.whiles[1].call @
      whiles: [
        _.throttle( ->
          if $('.ui-draggable-dragging').length > 0
            ($ @).animate PIC.physics.friction(@), duration:200, queue:false
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
          ($ @).animate $.extend(
              scale: [U.xy ($ @).data 'scale'],
              PIC.physics.toss(@), PIC.physics.friction(@)
            ), duration:1000, step:PIC.events.step
          _.delay PIC.physics.shuffle, 500, @
      setup: ->
        ($ '.pics .pic').draggable
          containment: 'parent'
          start: @start
          drag: @while
          stop: @stop
    trash:
      delete: (event, ui)->
        ($ ui.draggable).addClass('removed').fadeOut()
        ($ '#trash').addClass('full')
      restore: ->
        ($ '.pics .pic:hidden').removeClass('removed').fadeIn()
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

        #console.log('now', now)
        #console.log('now quanta', now - (param.before||0))
        #console.log('quanta', quanta)

        param.before = now

        prop = U.float(pic.css(lt)) + ((param.bounce||1)*quanta)

        hw = if fx.prop is 'topToss' then 'height' else 'width'
        if (prop+pic[hw]() > $('#canvas')[hw]()-60) or prop < 0
          param.bounce = (param.bounce||1) * -1.5
          #console.log('BOUNCE', param.bounce )

        pic.css( lt, U.float(pic.css(lt)) + (param.bounce||1)*quanta )

        param = pic.data(lt, param)

        #console.log(lt, pic.css(lt))
        #console.log('----')

  setup: (options={sort:false})->
    e = PIC.events
    ($ '.pics .pic').dblclick(e.dblclick).click(e.click).find('img').load(e.load)
    if options.sort
      PIC.events.drag.setup()

  display: (pics)->
    ($ '#shoebox').find('.loading').remove()
    PIC.events.trash.setup()

    for pic in pics
      ($ '.pics').append( $('<div class="pic" data-id="'+pic.data_id+'" />').html('<img src="'+pic.url_s+'" /><div class="backside"><span>'+pic.title+'</span></div>') ).
        find('.pic:last').css('z-index', PIC.stack.topmost())
    PIC.setup()
)

window.U = U =
  line:
    length: (l)-> Math.sqrt Math.pow(l[0].x-l[1].x,2) + Math.pow(l[0].y-l[1].y, 2)
    flatten: (l)-> if l[0].x is l[1].x then [l[0].y, l[1].y] else [l[0].x, l[1].x]
    intersect: (l1, l2)->
      points = _.union @flatten(l1), @flatten(l2)
      (_ points).max() - (_ points).min() <= @length(l1) + @length(l2)
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
  shuffle: (ary) -> (ary.sort -> U.rand() )
  xy: (n)->[n,n]
  float: (str)-> parseFloat str
  log: (text, o) ->
    if o
      console.log text, if o then U.print o
      o
    else
      console.log U.print text
      text
  print: (obj)->
    if not $.isPlainObject obj
      obj
    else
      '{'+("#{key}:#{if $.isPlainObject value then U.print value else value}" for key, value of obj).join(', ')+'}'

window.BOX = BOX =
  setup: ->
    ($ '#shoebox .canvas-background').css height: $(window).height()
    ($ '#canvas' ).css height: $(window).height() - $('#shoebox #toolbar').height(), top:$('#shoebox #toolbar').height()
    ($ '#shoebox').css 'padding-top', ($ window).height()
    ($ '#overlay').attr width:($ '#canvas').width(), height:($ '#canvas').height()
    ($ '.pics').css width:($ '#canvas').width(), height:($ '#canvas').height()
    @sort.setup()
  data:
    fetch: (set, size) ->
      PIC.total = size || PIC.total
      BOX.data.flickr.fetch set
    render: (data) ->
      BOX.title.setup(data)
      pics = U.shuffle( data.photoset.photo ).slice(0, PIC.total)
      comments = U.shuffle( DATA.comments )
      pics = _(pics).map (pic, i)->
        c = U.shuffle([1,2,3,4])[0]
        pics[i] = _(pic).extend
          data_id: i
          comments: _(comments).first(c)
          date: U.shuffle(DATA.dates)[0]
          popularity: 5 + (5*U.rand())
          location: U.shuffle(DATA.locations)[0]
        DATA.comments = _(comments).first(c)
        pics[i]
      DATA.pics = pics
      PIC.display pics
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
      sort = ($ @).toggleClass('selected').text().toLowerCase()
      BOX.sort[ if ($ @).hasClass 'selected' then sort else 'reset' ]()
    reset: ->
      _pics = $('.pics').clone()
      PIC.pile.size = 1
      _( _pics.find('.pic') ).each( (pic, i) -> $(pic).css( PIC.pile.place($(pic), i) ) )
      $('.pics').quicksand _pics.find('.pic').get(), (-> PIC.setup(sort:true))
    location: ->
      pics = $('.pics .pic')
      grouped = (_ DATA.pics).groupBy (pic) -> pic.location

      _pics = $('.pics').clone()
      PIC.pile.size = 4
      _( _pics.find('.pic') ).each( (pic, i) -> $(pic).css( PIC.pile.place($(pic), i) ) )
      $('.pics').quicksand _pics.find('.pic').get(), {adjustHeight:false}, (-> PIC.setup(sort:true))
  title:
    setup:(data)->
      title = data.photoset.ownername+"'s Shoebox"
      ta = ($ '#toolbar textarea')
      
      ta.val( title ).focus(-> ta.addClass 'focus').blur(-> ta.removeClass 'focus').
        keyup(@change).data
          width:
            max: $('#toolbar .container').width() - $('.logo-1000').width() - $('#sorts').width() - 400
            min: ta.width()
          height:
            min: ta.height()
      ($ '#toolbar .shadow').css 'max-width', ta.data('width').max
      $('#toolbar .title').css('visibility', 'visible').hover( (->($ @).addClass 'hover'), {adjustHeight:false}, ->(($ @).removeClass 'hover'))
      @change.call ta
      @change.call ta #for some reason, initial height needs this double call (?)
    change:()->
      ta = $ @
      shadow = ($ '#toolbar .shadow').text ta.val()+' '
      padding = 2*U.float ta.css('padding-top')
      margin = 2*U.float ta.css('margin-top')
      ta.css
        width: Math.min ta.data('width').max , Math.max( ta.data('width').min, shadow.width()+50)
        height: Math.min 100, Math.max( ta.data('height').min, shadow.height() )
      ($ '#toolbar img.background').css
        width: ta.width()+padding+2
        height: ta.height()+padding+2
      ($ '#toolbar .title').css
        width: ta.width()+padding+margin+2
        height: ta.height()+padding+margin+2

$ ->
  BOX.setup()
