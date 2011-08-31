window.SHOE = SHOE =
  images:
    get: (set=1341466) ->
      $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=a948a36e48c16afbf95a03c85418f417&photoset_id='+
        set+'&format=json&extras=url_s&jsoncallback=?', SHOE.images.display)
    display: (data) ->
      $('#shoebox p').remove()
      _(data.photoset.photo.sort( () -> .5-Math.random() )).chain().
        first(30).
        each( (value, key, list) ->
          $('#canvas').append('<a href="javascript:void(0)"><img src="'+value.url_s+'" /><span>'+value.title+'</span></a>')
        )
      $('#canvas a').each( () -> $(this).rotate(30*(.5-Math.random())) ).
        click(() ->
          that = $(this)
          that.flip(
            direction:'lr'
            speed:400
            onEnd: () -> that.toggleClass('backside')
          )
        ).find('img').load( () ->
          $(this).parent().css(
            height:$(this).outerHeight()
            width:$(this).outerWidth()
          )
        )

$( () ->
  SHOE.images.get()
)
