window.SHOE = SHOE =
  images:
    total:9, count:0,
    piles:[{x:.25, y:.4}, {x:.75, y:.25}, {x:.6, y:.75}]

_(SHOE.images).extend(
    fetch: (set=1341466) ->
      $.getJSON('/data?jsoncallback=?', SHOE.images.display)
        #'http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=a948a36e48c16afbf95a03c85418f417&photoset_id='+ set+'&format=json&extras=url_s&jsoncallback=?'
    pile: (i) ->
      this.piles[Math.floor(i/(this.total/3))]
    place: (pic, count, radius=200) ->
      limit = {x:$('#canvas').width(), y:$('#canvas').height()}
      pile = this.pile(count) #pile of relative values
      pile = {x:limit.x*pile.x, y:limit.y*pile.y} # pile of concrete values
      pic.css(
        left:Math.min(limit.x, Math.max(0, pile.x+(radius*U.rand())-pic.outerWidth()/2) )
        top:Math.min(limit.y, Math.max(0, pile.y+(radius*U.rand())-pic.outerHeight()/2) )
      )
    stack:
      topmost: ()-> _([_($('#canvas .pic')).chain().map( (pic)-> ~~$(pic).css('z-index') ).max().value(), 0]).max() + 1
      index: (obj)-> parseInt($(obj).css('z-index'))||0
      get: (from)->
        stack = SHOE.images.stack
        $(_($('#canvas .pic').removeClass('topStack')).select( (pic)->
          stack.index(from) < stack.index(pic) and U.rect.intersect( U.rect.extract(from), U.rect.extract(pic) )
        )).addClass('topStack')
      _clear: (from)->
        flip = {'-=':'+=', '+=':'-='}; delta = '75px'
        $('.topStack').each(()->
          left = if (parseInt($(this).css('left')) < parseInt(from.css('left'))) then '-=' else '+='
          top = if (parseInt($(this).css('top')) < parseInt(from.css('top'))) then '-=' else '+='
          $(this).animate({left:left+delta, top:top+delta}, 400).
            animate({left:flip[left]+delta, top:flip[top]+delta}, 400)
        )
      clear: (from)->
        this.get(from)
        this._clear(from)
        _.delay( ( ()-> from.css('z-index', SHOE.images.stack.topmost()) ), 300)
    events:
      dblclick: ()->
        that = $(this)
        SHOE.images.stack.clear(that)
        that.rotate3Di('toggle', 700,
            sideChange: ()-> that.toggleClass('flipped')
          )
      load: ()->
        pic = $(this).parents('.pic')
        pic.add(pic.find('.backside')).css( height:$(this).outerHeight(), width:$(this).outerWidth() ).end().
          data('rotation',30*U.rand()).transform({rotate:pic.data('rotation')+'deg', scale:[1.25, 1.25]}).
            animate({scale:[[1,1]]}, 600)
        SHOE.images.place(pic, SHOE.images.count++)
        SHOE.images.events.allLoad()
      allLoad: _.after(SHOE.images.total, ()->
        $('#canvas .pic').draggable(
          containment:'parent'
          start: ()->
            SHOE.images.stack.clear( $(this) )
            $(this).animate({scale:[[1.25,1.25]]}, 300)
          stop: ()->
            $(this).animate({scale:[[1,1]]}, 300)
        ))
    display: (data)->
      data = data.photoset.photo.sort( ()->U.rand() ).slice(0, SHOE.images.total)
      e = SHOE.images.events
      $('#shoebox p').remove()

      for item in data
        $('#canvas').append( $('<div class="pic" />').html('<img src="'+item.url_s+'" /><div class="backside"><span>'+item.title+'</span></div>') ).
          find('.pic:last').css('z-index', SHOE.images.stack.topmost())
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
  rect:
    extract: (o)->
      o = $(o); left = parseInt(o.css('left')); width = o.outerWidth(); height = o.outerHeight(); top = parseInt(o.css('top'))
      a: {x:left, y:top}, b: {x:left+width, y:top}
      c: {x:left, y:top+height}, d: {x:left+width, y:top+height}
    intersect: (rect1, rect2)->
      U.line.intersect([rect1.a, rect1.b], [rect2.a, rect2.b]) and U.line.intersect([rect1.a, rect1.c], [rect2.a, rect2.c])
  rand: ()->.5-Math.random()
  log: (text, o) ->
    console.log(text, o)
    o
  print: (obj)-> '{'+("#{key}:#{if $.isPlainObject(value) then U.print(value) else value}" for key, value of obj).join(', ')+'}'

$( () ->
  SHOE.images.fetch()
)
