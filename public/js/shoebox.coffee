# ***SHOEBOX*** is a CoffeeScript photo manager with physical interactions & sortings. 
# It works best in Chrome, Safari, Firefox & IE9.
# In IE8-, interactions are clunky but sorting's pretty smooth.
#
# [CoffeeScript 1.1.2](http://jashkenas.github.com/coffee-script/) is used, pretty idiomatically.
# [jQuery 1.6.2](http://jquery.com/) and [Underscore.js 1.1.7](http://documentcloud.github.com/underscore/) are assumed.
# Blessed be John Resig & Jeremy Ashkenas.
#
# Made for [Momentus Media](http://momentusmedia.com/).
#
# Coded in September 2011 by [Eli Parra](http://elzr.com/) in Mexico City.

#### BOX
# One of the 2 global objects that run the show. This one stands for the stage and its related properties and methods, chief among which are the sortings.
#
# The general structure of BOX is:
#
# * a `#shoebox` global shoebox container.
# * a `#toolbar` containing the `#sorts`, the `.title` plaque and the 1000memories logo
# * a `.loading` message
# * the main `#canvas`
#     * a `#pics` container with nothing but `.pic`s
#     * a `#chart` (with an `#axis`), used in date & popularity sorting
#     * a `#canvas-background` image
#     * 2 button `.ear`s at each side
#     * a `#trash` bar at the bottom
window.BOX = BOX =
  # Are you not IE or if you are, are you at least IE9+?
  goodBrowser: (not $.browser.msie) or ( (not $.browser.msie) and $.browser.version >= 8 )
  # Calculate (or just retrieve) a **scale** appropriate to the current window dimensions.
  scale: (recalculate)->
    if not BOX.scale.saved? or recalculate?
      BOX.scale.saved = H.fit .75, $(window).width()*$(window).height() / 1.1e6, 2
    else
      BOX.scale.saved
  # Setup sort, initial & automatic resizing, and autoscrolling back to 0.
  setup: ->
    @sort.setup()
    BOX.resize()
    ($ window).resize( _.debounce(BOX.resize, 500) )
    ($ window).scroll -> ($ window).scrollTop(0).scrollLeft(0)
  # Set lots of appropriate sizings. For one reason or another, the chore falls on us.
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
    # Overly smart ear sizing appropriate to window dimensions.
    ($ '.ear').cssMultiply(['width', 'height'], H.fit(1, BOX.scale()*.8, 1.5) ).
        find('img').cssMultiply(['margin-top', 'margin-bottom'], H.fit(1, BOX.scale()*1.5, 3)).
          cssMultiply ['margin-right', 'margin-left'], H.fit(1, BOX.scale()*1.1, 2)

  # Trigger size recalculations & pic repositions on window resizing.
  resize: ->
    BOX.size()
    BOX.scale('recalculate')

    (_ $ '.pic').each (pic)->
      $(pic).imgAnimate(scale:[H.xy BOX.scale() * $(pic).data 'scale'], 600)
    
    BOX.title.setup()
    sort = ($ '#sorts a.selected').text().toLowerCase() or 'reset'
    BOX.sort.clear()
    BOX.sort[ sort ]()

  #### DATA
  # Interact with external data.
  data:
    # **Fetch** the data. The one link to the external world (currently Flickr).
    # It gets its parameters (Flickr set id & number of images to display) from the URL.
    fetch: (set, size) ->
      PIC.total = size || PIC.total
      BOX.data.flickr.fetch set
    # Upon return of Flickr data, **render** it. Put the Flickr album title in the title plaque,
    # mix the Flickr data with the mocks and start displaying it.
    render: (flickr) ->
      BOX.title.setup flickr
      pics = BOX.data.mix flickr
      PIC.display.setup pics
    # **Mix** the flickr `data` randomly with mocks from `data.js` (comments, locations, dates) and plain randomn data (popularity).
    # Start by shuffling the photos, picking only the number we're displaying.
    mix: (data) ->
      pics = H.shuffle( data.photoset.photo ).slice(0, PIC.total)
      comments = H.shuffle( DATA.comments )
      pics = _(pics).map (pic, i)->
        c = H.shuffle([1,2,3,4,5])[0]
        pics[i] = _(pic).extend
          order: i
          comments: _(comments).first(c)
          date: H.shuffle(DATA.dates.all)[0]
          popularity: 5 + (5*H.rand())
          location: H.shuffle(DATA.locations.all)[0]
        comments = _(comments).rest(c)
        pics[i]
      DATA.pics = pics
    # Fetch a given `set` from **Flickr**.
    flickr:
      fetch:(set) ->
        set or= PIC.sets['family']
        $.getJSON(
          "http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=a948a36e48c16afbf95a03c85418f417&photoset_id=#{set}&format=json&extras=url_s&jsoncallback=?",
          BOX.data.render
        )
            
  #### SORT
  # Sort pics by either location, popularity or date. The bulk of the BOX object.
  sort:
    # Initial click binding & width setting (to prevent glitches when bolding the text).
    setup: ->
      ($ '#sorts a').click(@click).each(-> ($ @).css 'width', ($ @).width())
    # On **click** toggle which button is selected and trigger the appropriate sorting.
    # Flip back already flipped pics.
    click: ->
      ($ '#sorts a').not(@).removeClass('selected')
      BOX.sort.clear()
      sort = ($ @).toggleClass('selected').text().toLowerCase()
      ($ '.pic.flipped:visible').dblclick()
      BOX.sort[ if ($ @).hasClass 'selected' then sort else 'reset' ]()
    # Reset positioning to the initial one big pile.
    reset: ->
      BOX.sort.reposition size:1, sort:'reset'
    # Clear location labels & chart (which contains popularity & date labels).
    clear: ->
      $('#canvas .location').remove()
      $('#chart').hide()
    # Sort by **location**. Start by grouping pics by their location.
    # Reposition pics in as many piles as there were diffrent locations.
    # A bit later (when all pics have been repositioned), place the location labels.
    location: ->
      grouped = (_ DATA.pics).groupBy (pic) -> pic.location
      DATA.locations.present = locations = (_ grouped).keys()
      @reposition size:locations.length, sort:'location'
      _.delay (=> (@label.location grouped, locations)), 600
    # Sort by **popularity**. Assign to each *visible* pic a concrete position by using popularity
    # as the relative proportion of the chart boundaries. Then reposition the pics and place the popularity labels.
    # Height is slightly damped for aesthetics.
    popularity: ->
      chart = @get.chart()
      pops = @get.popularity()

      (_ @get.visible DATA.pics ).map (pic)->
        pop = (pic.popularity - pops.min) / (pops.max - pops.min)
        relative = x: pop, y: pop
        concrete = H.point.multiply chart, relative
        pic.position =
          left: chart.left + H.fit 0, concrete.x - pic.$html.outerWidth(), chart.x
          top: chart.height - H.fit 50, concrete.y - pic.$html.outerHeight()/2, chart.height-50

      @reposition()
      @label.popularity
    # Sort by **date**. Start by grouping pics by their date. 
    # Place the date labels for the found dates. Assign to each *visible* pic a concrete position relative
    # horizontally to its date, and around the center vertically. Reposition the pics.
    date: ->
      grouped = (_ DATA.pics).groupBy (pic) -> pic.date
      DATA.dates.present = dates = (_ grouped).keys().sort()
      @label.date dates

      chart = @get.chart()
      (_ @get.visible DATA.pics ).map (pic, i, list)->
        group = grouped[pic.date]
        index = dates:_(dates).indexOf(pic.date+''), date: ( ((_ group).indexOf pic) + 1)/group.length
        offcenter = if index.date is 0 then 0 else index.date*(chart.height/5)*(1+(index.date%2)*-2)
        relative = x: index.dates/dates.length, y: .5
        concrete = H.point.multiply chart, relative
        pic.position =
          left: chart.left + H.fit 0, concrete.x, chart.x
          top: chart.height - (H.fit 0, concrete.y - pic.$html.outerHeight()/2 - offcenter, chart.height)

      @reposition()

    # **Reposition** pics into `options.size` piles. If `options.sort` is `location` or `reset` let PIC.pile calculate their position,
    # otherwise each pic already has its position calculated. Animate a slow moving to that position.
    reposition: (options = {})->
      PIC.pile.size = options.size if options.size
      (_ @get.visible DATA.pics).each (pic, index, pics)->
        position = if options.sort in ['location', 'reset'] then PIC.pile.place(pic.$html, pic.location) else pic.position
        pic.$html.animate position, 600

    # ***Labels***
    label:
      # Find the pic in `group` with the tallest top.
      findTop: (group)->
        _(group).chain().map((pic)-> H.rect.extract( pic.$html.find 'img' ).tl.y).
          reduce( ((memo, top)-> Math.min memo, top)).value()
      # Place **location** labels by relying on PIC.pile and making some adjustments
      # to ensure labels are never hidden behind pics. Toggle labels of deleted/restored pics.
      location: (grouped, locations)->
        (_ locations).each (location)=>
          [limit, concrete] = PIC.pile.position.concrete location
          $label = $('<div class="location">'+location+'</div>').appendTo '#canvas'
          group = grouped[location]
          if BOX.sort.get.visible(group).length > 0
            top = @findTop group
            $label.show().css
              left: H.fit 0, concrete.x - $label.outerWidth()/2, limit.x
              top: H.fit 0, top - BOX.scale()*20 - $label.outerHeight(), limit.y
          else
            $label.hide()
      # Place **date** labels proportionally across the chart's horizontal axis.
      date: (dates)->
        $('#chart').fadeIn('slow')
        length = H.float(($ '#axis').width()) / H.float(dates.length)
        spans = (_ dates ).map (date, i)-> "<span style=\"left:#{length*(i+.3)}px\">#{date}</span>"
        $('#axis').html('').append( spans... )
      # Place **popularity labels** labels at each extreme of the chart's horizontal axis.
      popularity: ()->
        $('#chart').fadeIn('slow')
        $('#axis').html('').append(
          '<span>- LEAST Popular</span>',
          '<span style="left:auto; right:0">+ MOST Popular</span>')

    # Convenience methods for sorting.
    get:
      # Get only **visible** pics.
      visible: (pics) ->
        _(pics).filter (pic)-> pic.$html.is(':visible')
      # Get position and dimensions of the **chart**
      chart: ->
        (chart = $('#chart')).fadeIn('slow')
        out = x:chart.width(), y:chart.height(), left:chart.position().left, top:chart.position().top, height:chart.height()-$('#axis').height()-150
      # Get max and min popularities.
      popularity: ->
        all = (_ @visible DATA.pics ).chain().map( (pic)-> pic.popularity)
        all:all, max:all.max().value(), min:all.min().value()

  #### TITLE
  # A dynamically sized title plaque.
  title:
    # Load the set's title and make the plaque visible.
    # Bind focus, keyup, hvoer. Initialize min & max height & width.
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
      #For some reason, an accurate initial height needs this double call (?)
      @change.call ta
    # Reproduce each **change** in the title plaque to an invisible shadow div.
    # Then synchronize the title plaque's height & width with the shadow div's -- within bounds.
    # It gets extra complicated by the need to handle padding's & margin's when updating two objects, both the title plaque and its background img.
    change:()->
      ta = $ @
      shadow = ($ '#toolbar .shadow').text ta.val()+' '
      padding = 2*H.float ta.css('padding-top')
      margin = 2*H.float ta.css('margin-top')
      ta.css
        width: H.fit ta.data('width').min, shadow.width()+50, ta.data('width').max
        height: H.fit ta.data('height').min, shadow.height(), 100
      ($ '#toolbar img.background').css
        width: ta.width()+padding+2
        height: ta.height()+padding+2
      ($ '#toolbar .title').css
        width: ta.width()+padding+margin+2
        height: ta.height()+padding+margin+2

#### PIC:
# One of the 2 global objects that make it all work. This one deals with, well, pics.
# Pics consist of a container `.pic` div and 2 children: an `img` and a `.backside` which holds comments.
# Occasionally I use a superobject derived stored at `DATA.pics` which contains further data associated with pic.
window.PIC = PIC =
  # Total number of pictures we want to display (1...30?). 
  total:8
  css:
    #Maximum rotation degrees allowed (positive or negative).
    rotation:45
    #Initial base scaling of all pics.
    scale:.75
  # Flickr sets (ids) to fetch photos from.
  sets:
    family:'72157594183166324'

(_ PIC).extend(
  #### PILE:
  # In charge of *placing* pics into piles.
  pile:
    # How many piles?
    size:1
    # Hard-coded relative positions for 1 to 5 piles.
    positions:[
      [ {x:.5, y:.5} ]
      [ {x:.2, y:.4}, {x:.8, y:.4} ]
      [ {x:.25, y:.4}, {x:.75, y:.25}, {x:.6, y:.75} ]
      [ {x:.25, y:.25}, {x:.25, y:.75}, {x:.75, y:.25}, {x:.75, y:.75} ]
      [ {x:.2, y:.2}, {x:.2, y:.75}, {x:.5, y:.5} , {x:.75, y:.2}, {x:.75, y:.75} ]
    ]
    # Get a **pile**'s relative or concrete position.
    position:
      # Fetch a pile's **relative** position.
      # Either there's only one pile,
      # or the index is the pic's location,
      # or there are many piles (legacy case).
      relative: (count)->
        index = if PIC.pile.size == 1
              0
          else
            if (_ count).isString()
              (_ DATA.locations.present).indexOf count
            else
              Math.floor count/PIC.total/PIC.pile.size
        PIC.pile.positions[ PIC.pile.size - 1 ][ index ]
      # Calculate a pile's **concrete** position
      # by multiplying the absolute boundaries by the relative values.
      concrete: (count) ->
        relative = @relative count
        chart = x:($ '#canvas').width(), y:($ '#canvas').height()
        concrete = H.point.multiply chart, relative
        [ chart, concrete ]
    # Calculate a **pic**'s (not a pile's) position according to its count (order).
    # **Radius** is how far from a pile's position a pic can randomly get placed.
    # For more than one pile, y-radius is 0 for more useful location sorting.
    place: (pic, count) ->
      [chart, concrete] = PIC.pile.position.concrete count
      radius = if PIC.pile.size is 1 then {x:400, y:400}  else {x:200, y:0}
      offset = H.point.multiply radius, {x:H.rand(), y:H.rand()}
      left: H.fit( 0, concrete.x + offset.x - $(pic).outerWidth()/2, chart.x )
      top: H.fit( 0, concrete.y + offset.y - $(pic).outerHeight()/2, chart.y )

  #### STACK
  # Awareness of pic stacks.
  stack:
    # Get the **topmost** z-index of all pics, plus one.
    topmost: -> _( @index(pic) for pic in ($ '#pics .pic') ).max() + 1
    # Get a pic's **z-index**, ensuring it is always an integer (not a string, like 'auto').
    index: (obj)-> ~~$(obj).css('z-index')
    # Get the `pics` that are *stacked* `atop` or `below` the `from` element.
    # Atop-below-ness is determined with z-indexes.
    # Stacked-ness is determined by intersecting the rectangles of each `pic` with `from`.
    get: (atopBelow, from, pics)->
      flip = {atop:1, below:-1}[atopBelow]
      pics ?= $('#pics .pic').removeClass('topStack')
      fromRect = if $(from).hasClass('pic') then $(from).find('img') else $(from)
      pic for pic in pics when flip*@index(from) < flip*@index(pic) and H.rect.intersect fromRect, $(pic).find('img')
    # **Clear away**, momentarily (`flip`), `from`'s `stack`, by `delta` pixels
    _clear: (stack, from)->
      [flip, delta, from] = [{'-=':'+=', '+=':'-='}, '75px', ($ from)]
      for pic in stack
        left = if H.float(($ pic).css 'left') < H.float(from.css 'left') then '-=' else '+='
        top = if H.float(($ pic).css 'top') < H.float(from.css 'top') then '-=' else '+='
        ($ pic).animate(left:left+delta, top:top+delta, 400).
          animate left:flip[left]+delta, top:flip[top]+delta, 400
    # Public-facing **clear** method. Clears the stack atop and places
    # `from` on top
    clear: (from)->
      @_clear (@get 'atop', from), from
      _.delay (=> ($ from).css 'z-index', @topmost()), 300

  #### PHYSICS
  # A mishmash of special-purpose hacks, not a whole self-consistent world.
  physics:
    # **Dangle** a pic back to 0 (or almost) rotation when you grab it.
    # Do it in several (500ms intervaled) random dangles, in alternating directions.
    dangle:
      start: (pic)->
        @stop pic
        @_dangle pic
        _.delay (=> ($ pic).data 'dangle', window.setInterval => @_dangle pic, 500), 500
      stop: (pic) ->
        clearInterval ($ pic).data 'dangle'
      _dangle: (pic)->
        if $('.ui-draggable-dragging').length > 0
          r = ($ pic).data('rotation')/(1.5+H.rand()) * -1
          if Math.abs(r) < 3
            r = 0
            @stop pic
          ($ pic).data('rotation', r).
            imgAnimate rotate: r+'deg', {duration:500, queue:false}
        else
          @stop pic
    # Calculate the **vector** (distance with direction) from the position 500ms ago to the current one.
    vector: (pic)->
      [before, now] = [($ pic).data('position.before'), ($ pic).position()]
      x: now.left-before.left, y: now.top-before.top
    # Calculate a slight (`damp`), **frictional** rotation of a pic according to it's `vector` when tossing and dragging it around. 
    # Within the global max rotation.
    friction: (pic)->
      [vector, damp] = [(@vector pic), 500]
      r = ($ pic).data('rotation')+(30*vector.x/damp)+(15*vector.y/damp)
      r = H.fit -PIC.css.rotation, r, PIC.css.rotation
      ($ pic).data 'rotation', r
      rotate: r+'deg'
    # **Setup** calculates the end position after **tossing** a pic:
    # how slightly (`damp`) more it should keep going in the direction.
    # Setup sets the stage for **step**, which actually runs the animation and deals with wall bouncing.
    toss:
      setup:(pic)->
        [vector, damp] = [(PIC.physics.vector pic), 2]
        ($ pic).css(leftToss:0, topToss:0).data
          left:
            original: H.float ($ pic).css 'left'
            toss: vector.x/damp
            before: 0
            bounce: 1
          top:
            original: H.float ($ pic).css 'top'
            toss: vector.y/damp
            before: 0
            bounce: 1
        leftToss:100, topToss:100
      step: (now, fx)->
        if fx.prop in ['leftToss', 'topToss']
          lt = if fx.prop is 'leftToss' then 'left' else 'top'
          pic = $(fx.elem)
          param = pic.data(lt)
          quanta = ((now - (param.before||0))/100) * param.toss
          param.before = now
          prop = H.float(pic.css(lt)) + ((param.bounce||1)*quanta)
          hw = if fx.prop is 'topToss' then 'height' else 'width'

          if (prop+pic[hw]() > $('#canvas')[hw]()-60) or prop < 0
            param.bounce = (param.bounce||1) * -1.5

          pic.css( lt, H.float(pic.css(lt)) + (param.bounce||1)*quanta )
          param = pic.data(lt, param)
    # **Shuffle** (rotate randomly) the pics that end up below `pic` halfway through its tossing.
    shuffle: (pic)->
      for below in PIC.stack.get('below', pic)
        below = $ below
        below.data( rotation:below.data('rotation')+(PIC.css.rotation*H.rand()) ).
          imgAnimate rotate:below.data('rotation'), {duration:500, queue:false}
    # Toggle **flip** a photo & its commented backside. Normally a cool 3D effect, 
    # it downgrades to a simple class switch to deal with IE8-
    flip:
      start:(pic)->
        if not BOX.goodBrowser
          pic.toggleClass('flipped').find('.backside')#.jScrollPane()
        else
          pic.rotate3Di 'toggle', 700, sideChange: PIC.physics.flip.middle
      middle:()->
        pic = ($ @)
        if pic.toggleClass('flipped').hasClass 'flipped'
          pic.find('.backside').animate(scale:[H.xy BOX.scale() * pic.data('scale')], 300)#.jScrollPane()

  #### EVENTS
  # All the events associated with a pic.
  events:
    # On **double click**, clear pics atop and flip.
    dblclick: ->
      PIC.stack.clear @
      PIC.physics.flip.start $ @
    # On **load** of a pic's image, initialize with its heigh & width, give it a slight rotation and scale tweak, 
    # and animate it as if falling. Also setup dragging & pagination.
    load: ->
      pic = ($ @).parents '.pic'
      pic.css(visibility:'visible').
        add( pic.find('.backside') ).css( height: ($ @).outerHeight(), width:($ @).outerWidth() ).end().
        data( rotation:PIC.css.rotation*H.rand(), scale: (PIC.css.scale+0.25*H.rand()) ).
        find('img, .backside').transform(rotate:pic.data('rotation')+'deg', scale:H.xy BOX.scale() * pic.data('scale') * 1.4)
      pic.imgAnimate(scale:[H.xy BOX.scale() * pic.data('scale')], 600)
      pic.css( PIC.pile.place pic, PIC.count++ )
      PIC.events.drag.setup()
      PIC.display.paginate.setup DATA.pics[pic.data 'order']
    # **Dragging**. On *start*, clear pics atop and animate a slight size increase.
    # *While* dragging, have the pic dangle and give it some friction every 250ms, while keeping track of its position every 500ms.
    # When *stopping*, trigger tossing, size reduction back to normal, some friction, and some shuffling --unless the pic has been removed.
    drag:
      start: ->
        PIC.stack.clear @
        ($ @).imgAnimate(scale:[H.xy BOX.scale() * ($ @).data('scale') * 1.2], 300).
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
          # To visualize a pic's vector: 
          # `H.line.draw(($ @).data('position.before'), ($ @).position())`
          ($ @).data 'position.before', ($ @).position()
        , 500)
      ]
      stop: ->
        PIC.physics.dangle.stop @
        unless ($ @).hasClass 'removed'
          ($ @).animate( PIC.physics.toss.setup(@), duration:1000, step:PIC.physics.toss.step ).
            imgAnimate( $.extend( {scale: [H.xy BOX.scale()*($ @).data 'scale']}, PIC.physics.friction(@)) , duration:1000, queue:false)
          _.delay PIC.physics.shuffle, 500, @
      setup: ->
        ($ '#pics .pic').draggable
          containment: 'parent'
          start: @start
          drag: @while
          stop: @stop
    # At the **trash** bar, accept droppings and *delete* them, *restore* them on click.
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
    # Bind all events to all pics.
    setup: ()->
      e = PIC.events
      ($ '#pics .pic').dblclick(e.dblclick).click(e.click).find('img').load(e.load)

  #### DISPLAY
  display:
    # Insert, with the right z-index, the actual HTML for each of the `pics`
    setup:(pics)->
      ($ '#shoebox').find('.loading').remove()
      PIC.events.trash.setup()

      (_ pics).each (pic, i)->
        ($ '#pics').append( DATA.pics[i].$html = $('<div class="pic" />').data(order:i).
          html('<img src="'+pic.url_s+'" /><div class="backside"><div class="text"></div><div class="pages">&nbsp;</div></div>') ).
          find('.pic:last').css('z-index', PIC.stack.topmost())
      PIC.events.setup()
    # **Pagination**
    paginate:
      # Setup a pic's commented backside.
      # If IE8- page naively (1 comment per page).
      setup: (pic)->
        comments = _(pic.comments).map(PIC.display.comment)
        @text = pic.$html.find('.text')
        @backside = pic.$html.find('.backside')
        @pages = pic.$html.find('.pages')
        pic.comments.grouped = grouped = if BOX.goodBrowser then @group(1, comments) else _(comments).map((c)->[c])
        @text.data('grouped', grouped).html('').append grouped[0]...
        @number(grouped) if grouped.length > 1
        @backside.addClass('badBrowser') if not BOX.goodBrowser
      # Number pages.
      number: (grouped)->
          @pages.append('<a href="javascript:void(0)">'+page+'</a>') for page in [1..grouped.length]
          @pages.find('a').click(@page).first().addClass('selected')
          @text.addClass('paged')
      # Page switching.
      page: ->
        text = $(this).parents('.backside').find('.text')
        text.html('').append text.data('grouped')[H.float($(this).text()) - 1]...
        $(this).siblings().removeClass('selected').end().addClass('selected')
      # **Group** smartly as many comments per page as can fit.
      group: (perpage, comments, grouped=[])->
        [first, rest] = H.split comments, perpage
        @text.html('').append first...
        if rest.length > 0
          grouped =
            if perpage is 1 or @text.height() <= @backside.height()
              @group perpage+1, comments, grouped
            else
              [first, rest] = H.split comments, perpage-1
              grouped[grouped.length] = first
              @group 1, rest, grouped
        else
          if perpage isnt 1 and @text.height() >= @backside.height()
            [grouped[grouped.length], grouped[grouped.length]] = H.split comments, perpage-1
          else
            grouped[grouped.length] = comments
        grouped
    # The actual HTML enclosure for each comment.
    comment: (c)->
      "<div class=\"comment\">#{c.comment}</div><div class=\"author\">- #{c.author}</div>"
)

#### HELPERS
# A mishmash of helper methods, the bulk of them geometry related.
window.H = H =
  xy: (n)->[n,n]
  # Sugar to ensure `between` falls between `min` and `max`. Most conceptually helpful function ever.
  fit: (min, between, max)->
    Math.min max, Math.max min, between
  # Sugar to split an array into 2 parts around `split`.
  split: (array, split)-> [_(array).first(split), _(array).rest(split)]
  # **Points**
  point:
    # **Multiply** any number of points. Each coordinate times it's respective coordinate.
    multiply: (a, b...)->
      [b, rest] = [b[0], _(b).rest()]
      out = x: a.x*b.x, y: a.y*b.y
      if not _(rest).isEmpty() then H.point.multiply(out, rest...)  else out
  # **Lines**
  line:
    # Calculate a line's **length**. We love you Pythagoras.
    length: (l)-> Math.sqrt Math.pow(l[0].x-l[1].x,2) + Math.pow(l[0].y-l[1].y, 2)
    # Assume the line is parallel to one of the axis and **flatten** it (get only the changing values).
    flatten: (l)-> if l[0].x is l[1].x then [l[0].y, l[1].y] else [l[0].x, l[1].x]
    # Find out if two lines **intersect** by assuming they are paralell to the axes
    # and flattening them. If the length of their flattening is smaller than the sum of each line,
    # then they intersect.
    intersect: (a, b)->
      points = _.union @flatten(a), @flatten(b)
      (_ points).max() - (_ points).min() <= @length(a) + @length(b)
    # **Draw** a red line with canvas. For debugging purposes.
    draw: (a, b)->
      c = ($ '#overlay')[0].getContext '2d'
      c.moveTo a.x||a.left, a.y||a.top
      c.lineTo b.x||b.left, b.y||b.top
      c.lineWidth = 5
      c.strokeStyle = 'red'
      c.stroke()
  # **Rectangles**
  rect:
    # **Extract** an unrotated (for simplicity) rectangle from a given object `o`.
    extract: (o)->
      o = $ o
      parent = o.parents('#pics, #canvas').first()
      # We go to such lengths here to get the offset because the image parent (.pic) 
      # has it's left and top erased by [the rotate plugin]([https://github.com/heygrady/transform]) in IE8-.
      [left, top] = [o.offset().left - parent.offset().left, o.offset().top - parent.offset().top]
      [width, height] = [o.outerWidth(), o.outerHeight()]
      tl: {x:left, y:top}, tr: {x:left+width, y:top}
      bl: {x:left, y:top+height}, br: {x:left+width, y:top+height}
    # **Draw** a rectangle `r` of a given `color`. For debugging purposes.
    draw: (r, color='red')->
      ($ '<div class="rect"/>').appendTo('#canvas').css(top:r.tl.y, left:r.tl.x, width:r.tr.x-r.tl.x, height:r.bl.y-r.tl.y, background:color)
    intersect: (a, b)->
      [a, b] = [(@extract a), (@extract b)]
      # To visualize this beautifully, activate here:
      # `H.rect.draw a`
      # `H.rect.draw b, 'blue'`
      out = H.line.intersect([a.tl, a.tr], [b.tl, b.tr]) and
        H.line.intersect([a.tl, a.bl], [b.tl, b.bl])
  # Convenience positive/negative <.5 randomness.
  rand: -> .5-Math.random()
  # Sort an array randomly.
  shuffle: (array) -> (array.sort -> H.rand() )
  float: (str)-> parseFloat str
  # A **log** that prints an object (see below) AND returns it.
  log: (text, o='') ->
    if o?
      console.log text+': ', H.print o
      o
    else
      console.log H.print text
      text
  # A convenience method to actually **print** (output as text) the contents of an object.
  # Chrome's console instead displays an interactive object which is akward to use and sometimes 
  # downright unhelpful (because objects change).
  print: (obj)->
    if not $.isPlainObject obj
      if (_ obj).isString() or (_ obj).isNumber() or (_ obj).isBoolean() or (_ obj).isDate() or (_ obj).isRegExp()
        obj+''
      else
        if (_ obj).isArray()
          '[ '+ (H.print el for el in obj).join(', ') + ' ]'
        else
          obj
    else
      '{ '+("#{key}:#{if $.isPlainObject value then H.print value else value}" for key, value of obj).join(', ')+' }'

# *Launch the snowball!*
$ -> BOX.setup()

# **Animate** the `img` and `.backside` children of the current pic.
# Originally, the container div `.pic` was the one rotated, but to accommodate IE8 we need to keep it "clean"
# and animate the children instead.
$.fn.imgAnimate = (args...) ->
  this.find('img, .backside').animate args...
  return this
# Convenience method to **multiply** a CSS property by a multiple. 
# It always uses the original (premultiply) value of the CSS property.
$.fn.cssMultiply = (attrs, multiple) ->
  (_ attrs).each (attr)=>
    this.data 'premultiply-'+attr, H.float( this.data('premultiply-'+attr) || this.css(attr))
    this.css( attr, this.data('premultiply-'+attr)* multiple )
  return this
