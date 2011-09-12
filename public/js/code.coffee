window.PIC = PIC =
  total:9, count:0, rotation:60
  sets: {abstract:'72157625438391339', obama:'72157626767345322', models:'72157606203394154', sexy:'72157607176703404', family5:'72157626228862861', family4:'72157610172574733', family3:'72157625806894425', family2:'72157594183166324', family1:'72157594172843597', faces:'72157605579131380', inventors:'72157605338975676', bw:'72157607708666180', objects:'72057594050733003', portman:'1476952'}

_(PIC).extend(
  fetch: (set=false, size=false) ->
    set = set||this.sets['family2']
    PIC.total = size||PIC.total
    $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=a948a36e48c16afbf95a03c85418f417&photoset_id='+ set+'&format=json&extras=url_s&jsoncallback=?', PIC.display)
      #'/data?jsoncallback=?'
  place:
    piles:[{x:.25, y:.4}, {x:.75, y:.25}, {x:.6, y:.75}]
    pile: (i) ->
      this.piles[Math.floor(i/(PIC.total/3))]
    arrange: (pic, count, radius=200) ->
      limit = {x:$('#canvas').width(), y:$('#canvas').height()}
      pile = this.pile(count) #pile of relative values
      pile = {x:limit.x*pile.x, y:limit.y*pile.y} # pile of concrete values
      pic.css(
        left:Math.min(limit.x, Math.max(0, pile.x+(radius*U.rand())-pic.outerWidth()/2) )
        top:Math.min(limit.y, Math.max(0, pile.y+(radius*U.rand())-pic.outerHeight()/2) )
      )

  stack:
    topmost: ()-> _([_($('#canvas .pic')).chain().map( (pic)-> ~~$(pic).css('z-index') ).max().value(), 0]).max() + 1
    index: (obj)-> $(obj).css('z-index')||0
    get: (atopBelow, from)->
      atopBelow = {atop:1, below:-1}[atopBelow]
      $(_($('#canvas .pic').removeClass('topStack')).select( (pic)->
        atopBelow*PIC.stack.index(from) < atopBelow*PIC.stack.index(pic) and
          U.rect.intersect( U.rect.extract(from), U.rect.extract(pic) )
      ))
    _clear: (stack, from)->
      flip = {'-=':'+=', '+=':'-='}; delta = '75px'
      stack.each(()->
        left = if U.float($(this).css('left')) < U.float(from.css('left')) then '-=' else '+='
        top = if U.float($(this).css('top')) < U.float(from.css('top')) then '-=' else '+='
        $(this).animate({left:left+delta, top:top+delta}, 400).
          animate({left:flip[left]+delta, top:flip[top]+delta}, 400)
      )
    clear: (from)->
      this._clear(this.get('atop', from), from)
      _.delay( ( ()-> from.css('z-index', PIC.stack.topmost()) ), 300)

  physics:
    dangle:
      start: (pic)->
        this.stop(pic)
        this._dangle(pic)
        $(pic).data('dangle', window.setInterval( (()->PIC.physics.dangle._dangle(pic)), 600) )
      stop: (pic) ->
        window.clearInterval( $(pic).data('dangle') )
      _dangle: (pic)->
        r = $(pic).data('rotation')/1.5 * -1
        if Math.abs(r)<5
          r = 0
          this.stop(pic)
        $(pic).data('rotation', r)
        $(pic).animate(rotate:r+'deg', {duration:600, queue:false})
    vector: (pic)->
      before = $(pic).data('position.before'); now = $(pic).position()
      {x:now.left-before.left, y:now.top-before.top}
    friction: (pic)->
      vector = this.vector(pic); damp = 500
      r = $(pic).data('rotation')+(30*vector.x/damp)+(15*vector.y/damp)
      r = if r > 0 then Math.min(r, PIC.rotation) else Math.max(r, -PIC.rotation)
      $(pic).data('rotation', r)
      {rotate:r+'deg'}
    toss: (pic)->
      vector = this.vector(pic); damp = 2
      $(pic).css(leftToss:0, topToss:0).
          data(
            left:{
              original:U.float($(pic).css('left'))
              toss:vector.x/damp
              before:0
              bounce:1
            }
            top:{
              original:U.float($(pic).css('top'))
              toss:vector.y/damp
              before:0
              bounce:1
            }
          )
      {leftToss:100, topToss:100}
    shuffle: (pic)->
      PIC.stack.get('below', pic).each( ()->
        $(this).data('rotation', $(this).data('rotation')+(PIC.rotation*U.rand())).
          animate(rotate:$(this).data('rotation'), {duration:500, queue:false})
      )

  events:
    dblclick: ()->
      that = $(this)
      PIC.stack.clear(that)
      that.rotate3Di('toggle', 700,
          sideChange: ()-> that.toggleClass('flipped')
        )
    load: ()->
      pic = $(this).parents('.pic')
      pic.add(pic.find('.backside')).css( height:$(this).outerHeight(), width:$(this).outerWidth() ).end().
        data('rotation',PIC.rotation*U.rand()).transform({rotate:pic.data('rotation')+'deg', scale:U.xy(1.35)}).
        data('scale',1+(.5*U.rand())).animate({scale:[U.xy(pic.data('scale'))]}, 600)
      PIC.place.arrange(pic, PIC.count++)
      PIC.events.allLoad()
    drag:
      start: ()->
        PIC.stack.clear( $(this) )
        $(this).animate({scale:[U.xy(1.5)]}, 300)
        $(this).data('position.before', $(this).position())
      while: ()->
        PIC.events.drag.whiles[0].call(this)
        PIC.events.drag.whiles[1].call(this)
      whiles: [
        _.throttle( ()->
          if $('.ui-draggable-dragging').length > 0
            $(this).animate( PIC.physics.friction(this), {duration:200, queue:false})
            PIC.physics.dangle.start( this )
        , 250),
        _.throttle( ()->
          #U.line.draw($(this).data('position.before'), $(this).position())
          $(this).data('position.before', $(this).position())
        , 500)
      ]
      stop: ()->
        PIC.physics.dangle.stop(this)
        $(this).animate( $.extend(
            {scale:[U.xy($(this).data('scale'))]},
            PIC.physics.toss(this), PIC.physics.friction(this)
          ), {duration:1000, step:PIC.events.step}
        )
        _.delay(PIC.physics.shuffle, 500, this)
      setup: ()->
        $('#canvas .pic').draggable(
          containment: 'parent'
          start: this.start
          drag: this.while
          stop: this.stop
        )
    trash:
      delete: (event, ui)->
        $(ui.draggable).fadeOut()
        $(this).attr('src','/img/ico/trash-full.png')
      restore: ()->
        $('#canvas .pic:hidden').fadeIn()
        $(this).attr('src','/img/ico/trash-empty.png')
      setup: ()->
        $('.trash').droppable(
          accept:'.pic'
          hoverClass:'hover'
          tolerance:'touch'
          drop:this.delete
        ).click(this.restore)
        
    step: (now, fx)->
      if fx.prop == 'leftToss' or fx.prop == 'topToss'
        lt = if fx.prop=='leftToss' then 'left' else 'top'
        pic = $(fx.elem)
        param = pic.data(lt)
        quanta = ((now - (param.before||0))/100) * param.toss

        #console.log('now', now)
        #console.log('now quanta', now - (param.before||0))
        #console.log('quanta', quanta)

        param.before = now

        prop = U.float(pic.css(lt)) + ((param.bounce||1)*quanta)

        hw = if fx.prop == 'topToss' then 'height' else 'width'
        if (prop+pic[hw]() > $('#canvas')[hw]()-60) or prop < 0
          param.bounce = (param.bounce||1) * -1.5
          #console.log('BOUNCE', param.bounce )

        pic.css( lt, U.float(pic.css(lt)) + (param.bounce||1)*quanta )

        param = pic.data(lt, param)

        #console.log(lt, pic.css(lt))
        #console.log('----')
    allLoad: _.after(1, ->
        PIC.events.drag.setup()
        PIC.events.trash.setup()
      )
  display: (data)->
    data = data.photoset.photo.sort( ->U.rand() ).slice(0, PIC.total); e = PIC.events
    $('#shoebox').find('.loading').remove()

    for item in data
      $('#canvas').append( $('<div class="pic" />').html('<img src="'+item.url_s+'" /><div class="backside"><span>'+item.title+'</span></div>') ).
        find('.pic:last').css('z-index', PIC.stack.topmost())
    $('#canvas .pic').dblclick(e.dblclick).click(e.click).
      find('img').load( e.load )
)

window.U = U =
  line:
    length: (l)-> Math.sqrt(Math.pow(l[0].x-l[1].x,2) + Math.pow(l[0].y-l[1].y, 2) )
    flatten: (l)-> if l[0].x == l[1].x then [l[0].y, l[1].y] else [l[0].x, l[1].x]
    intersect: (l1, l2)->
      points = _.union( this.flatten(l1), this.flatten(l2) )
      (_(points).max() - _(points).min()) <= (this.length(l1)+this.length(l2))
    draw: (a, b)->
      canvas = $('canvas')[0]
      context = canvas.getContext('2d')
   
      context.moveTo(a.x||a.left, a.y||a.top)
      context.lineTo(b.x||b.left, b.y||b.top)
      context.lineWidth = 5
      context.strokeStyle = 'red'
      context.stroke()
  rect:
    extract: (o)->
      o = $(o); left = U.float(o.css('left')); width = o.outerWidth(); height = o.outerHeight(); top = U.float(o.css('top'))
      a: {x:left, y:top}, b: {x:left+width, y:top}
      c: {x:left, y:top+height}, d: {x:left+width, y:top+height}
    intersect: (rect1, rect2)->
      U.line.intersect([rect1.a, rect1.b], [rect2.a, rect2.b]) and U.line.intersect([rect1.a, rect1.c], [rect2.a, rect2.c])
  rand: ()->.5-Math.random()
  xy: (n)->[n,n]
  float: (str)-> parseFloat(str)
  log: (text, o) ->
    if(o)
      console.log(text, U.print(o))
      o
    else
      console.log(U.print(text))
      text
  print: (obj)->
    if !$.isPlainObject(obj)
      obj
    else
      '{'+("#{key}:#{if $.isPlainObject(value) then U.print(value) else value}" for key, value of obj).join(', ')+'}'

$( () ->
  $('#canvas, .background').css('height', U.log('h', $(window).height()-60) )
  $('#shoebox').css('padding-top', $(window).height()-60)
  $('canvas').attr({width:$('#canvas').width(), height:$('#canvas').height()} )
)
