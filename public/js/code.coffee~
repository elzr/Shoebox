window.SHOE = SHOE =
  images:
    get: (set=1341466) ->
      $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=a948a36e48c16afbf95a03c85418f417&photoset_id='+set+'&format=json&extras=url_s&jsoncallback=?', SHOE.images.display)
    display: (data) ->
      $('#shoebox p').remove()
      _(data.photoset.photo.sort( () -> .5-Math.random() )).chain().
        first(30).
        each( (value, key, list) ->
          thumb = (value.url_s).replace("_m.jpg", "_t.jpg")
          $('#canvas').append('<img src="'+thumb+'" />')
        )
      $('#canvas img').each( () -> $(this).rotate(30*(.5-Math.random())) )

$( () ->
  SHOE.images.get()
)
