window.SHOE = SHOE =
  images:
    total:10, count:0,
    piles:[{x:.25, y:.4}, {x:.75, y:.25}, {x:.6, y:.75}]

    fetch: (set=1341466) ->
      $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=a948a36e48c16afbf95a03c85418f417&photoset_id='+
        set+'&format=json&extras=url_s&jsoncallback=?', SHOE.images.display)
    pile: (i) ->
      this.piles[Math.floor(i/(this.total/3))]
    place: (img, count, radius=200) ->
      limit = {x:$('#canvas').width(), y:$('#canvas').height()}
      pile = this.pile(count) #pile of relative values
      pile = {x:limit.x*pile.x, y:limit.y*pile.y} # pile of concrete values
      img.css(
        left:Math.min(limit.x, Math.max(0, pile.x+(radius*U.rand())-img.outerWidth()/2) ),
        top:Math.min(limit.y, Math.max(0, pile.y+(radius*U.rand())-img.outerHeight()/2) )
      )
    build: () ->
      a = $(this).parents('a'); img = $(this)
      SHOE.moko = img
      a.data('rotation',30*U.rand()).rotate(a.data('rotation')+'deg')
      a.css(
        height:img.outerHeight()
        width:img.outerWidth()
      )
      SHOE.images.place(a, SHOE.images.count++)
    display: (data) ->
      data = data.photoset.photo.sort( ()->U.rand() ).slice(0, SHOE.images.total)
      $('#shoebox p').remove()
      for item in data
        $('#canvas').append('<a href="javascript:void(0)"><img src="'+item.url_s+'" /><span>'+item.title+'</span></a>')
      $('#canvas a').hover(
          ()->$(this).animate({rotate:0}, 450),
          ()->$(this).animate({rotate:$(this).data('rotation')}, 450)
        ).dblclick(() ->
          that = $(this)
          that.rotate3Di('toggle', 700,
            sideChange: () ->
              that.toggleClass('backside')
          )
        ).find('img').load( SHOE.images.build )
      $(window).load( ()-> $('#canvas a').draggable(
        containment:'parent'
        stop: ()-> $(this).css('z-index',3)
      ))
U =
  rand:()->.5-Math.random()
  print:(obj)-> '{'+("#{key}:#{if $.isPlainObject(value) then U.print(value) else value}" for key, value of obj).join(', ')+'}'

$( () ->
  SHOE.images.fetch()
)
