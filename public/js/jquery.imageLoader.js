/*******JQUERY UI IMAGE LOADER PLUGIN v1.4 ************
*
*	by alan clarke
*	created: 6 Apr 2011
*	last update: 7 May 2011
*	alan@staticvoid.info
*
*	Special hanks to the following for their comments and bugfixes:
*		Romain Sauvaire, http://www.jefaisvotresite.com
*		Frank Boers, http://sevideo.se
*
*************************************************/
(function($) {

$.widget( "ui.imageLoader", { 
    options: { 
        async: true,
        images: [ ]
    },
    total: 0,
    _init: function(){ 
        var self = this;
		var i;

        self.total++;
        //load counter
        self.loaded = 0;

        //local variable to track image attributes
        self.data = [ ];
        self.stats = {
			loaded:0,
			errored:0,
			allcomplete:false
		};

		//if images option is a selector, collect all image sources from matched elements
		if( typeof self.options.images === 'string' ) {
			var images = [ ];
			$.map( $( self.options.images ), function(el, i){
	            images.push($(el).attr('src'));
			});		
			self.options.images = images;
		}
		
        for ( i = 0; i < self.options.images.length; i++ ){ 
            self.data.push( { 
                init: false,
                complete: false,
                error: false,
                src: self.options.images[ i ],
                img: new Image(),
                i: i
            });
        }

        //controls the number of threads simmultaneously loading unloaded images
        for ( i = 0;  ( ( i < self.data.length ) && ( ( self.options.async === true || i === 0 ) || i < parseInt( self.options.async, 10 ) ) ); i++ ){ 
        
            self._loadImg( i );

        }
        return self;
    },
    _loadImg: function( i ){ 
        var self = this;
        if ( i !== false && i < self.data.length ){ 

            if ( !self.data[ i ].init ){ 
            
                //lock image
                self.data[ i ].init = true;
                
                self._trigger( "start", null, { 
                    i: i,
                    data: self.getData( )
                });

                //using setTimeout to force multiple threading and give some time for garbage collection between image loads
                setTimeout( function(){ 
										
						//error event
	                    self.data[ i ].img.onerror = function(){ 

	                        self.loaded++;
							self.stats.errored++;
	                        self.data[ i ].error = true;
	                        self._trigger( "error", null, { 
	                            i: i,
	                            data: self.getData( )
	                        });
	
	                        self._complete( i );
	                    };

	                    self.data[ i ].img.onload = function(){ 
						
							//redirect to error for when a malformed image is passed in using firefox (thanks Frank Boers)
							if(self.data[ i ].img.width < 1 ) {
								return self.data[ i ].img.onerror();
							}
						
	                        self.loaded++;
							self.stats.loaded++;
	                        self.data[ i ].complete = true;

	                        self._trigger( "complete", null, { 
	                            i: i,
	                            data: self.getData( )
	                        });

	                        self._complete( i );
	                    };
	
                    //setting the src after the onload event incase image is already cached
                    self.data[ i ].img.src = self.data[ i ].src;
                    
                    
                }, 1 );
            }
        }
    },
    _complete: function( i ){ 
        var self = this;

		
        //if thread is synchronous move on to next unloaded image
        if ( !self.options.async || typeof self.options.async === "number" ){ 
            var next = self._next( i );
            self._loadImg( next );
        }

        //if last image, trigger allcomplete event
        if ( self.loaded === self.data.length ){ 
            //triger complete
            self._trigger( "allcomplete", null, self.getData( ) );
			self.stats.allcomplete = true;
        }
    },

    //returns index of next image that isn't already loading
    _next: function( j ){ 
        var self = this;
		var i;
		
        for ( i = 0; i < self.data.length; i++ ){ 
            if ( i !== j && !self.data[ i ].init ){ 
                return i;
            }
        }
        return false;
    },
    getData: function(){ 
        return $.extend( true, [ ], this.data );
    },
    getStats: function(){ 
        return $.extend( true, [ ], this.stats );
    },
    destroy: function(){ 
        $.Widget.prototype.destroy.apply( this, arguments );
    }
 });


})(jQuery);