window.SHOE = SHOE =
  rand:()->.5-Math.random()
  images:
    total:30,
    get: (set=1341466) ->
      $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=a948a36e48c16afbf95a03c85418f417&photoset_id='+
        set+'&format=json&extras=url_s&jsoncallback=?', SHOE.images.display)
    place: (img, pile, radius=200) ->
      limit = {x:$('#canvas').width(), y:$('#canvas').height()}
      pile = {x:limit.x*pile.x, y:limit.y*pile.y}
      img.css(
        left:Math.min(limit.x, Math.max(0, pile.x+(radius*SHOE.rand())-img.outerWidth()/2) ),
        top:Math.min(limit.y, Math.max(0, pile.y+(radius*SHOE.rand())-img.outerHeight()/2) )
      )
    display: (data) ->
      $('#shoebox p').remove()
      _(data.photoset.photo.sort( () -> .5-Math.random() )).chain().
        first(SHOE.images.total).
        each( (value, key, list) ->
          $('#canvas').append('<a href="javascript:void(0)"><img src="'+value.url_s+'" /><span>'+value.title+'</span></a>')
        )
      $('#canvas a').each( () ->
          $(this).data('rotation',30*SHOE.rand()).rotate($(this).data('rotation'))
        ).
        click(() ->
          that = $(this)
          that.flip(
            direction: if that.hasClass('backside') then 'rl' else 'lr'
            speed:400
            onAnimation: () -> that.toggleClass('backside')
          )
          
        ).find('img').load( () ->
          $(this).parent().css(
            height:$(this).outerHeight()
            width:$(this).outerWidth()
          )
          count = Math.floor((--SHOE.images.total)/10)
          pile = [{x:.25, y:.4}, {x:.75, y:.25}, {x:.6, y:.75}][count]
          SHOE.images.place($(this).parents('a'), pile)
        )
      otherFlip: (that) ->
        that.hover(
          ()->$(this).rotate(animateTo:0, duration:300),
          ()->$(this).rotate(animateTo:$(this).data('rotation'), duration:300)
        ).click( ()->
          flip = if that.hasClass('backside') then 'unflip' else 'flip'
          that.rotate3Di(flip, 700,
            sideChange: (front) ->
              that.toggleClass('backside')
              that.data('front',front)
          )
        )

$( () ->
  SHOE.images.get()
)
