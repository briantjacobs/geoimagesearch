var data = {  

   categories: {
      handler :'http://phillyhistory.org/PhotoArchive/SearchStream.ashx',
      params: {request: 'all'},
      },

   thumbnails: {
      handler :'http://phillyhistory.org/PhotoArchive/Thumbnails.ashx',
      params: {	
        limit: 60,
        noStore: false,
        request: 'Images',
        start: 0,
        urlqs: {}
			}
    },
	// this is an array so we can clone, alter and make a search history
   thumbnailQuery: {
   		results: 
					[{
					minx:'-8413034.983992',
					maxx:'-8321310.550067',
					miny:'4805521.955385',
					maxy:'4912533.794965',
					type:'area',
					withoutMedia:'false',
					withoutLoc:'false',
					updateDays:'0',
					onlyWithoutLoc:'false',
					sortOrderM:'DISTANCE',
					sortOrderP:'DISTANCE'
					}]
				}
}


//ADD PAGINATION

var btj = {
  prepareTemplates: function() {
  
      t_topicsContainer = Tempo.prepare('topicsContainer').notify( function(event) {
          if (event.type === TempoEvent.Types.RENDER_COMPLETE) {
           // $('#topicsContainer').isotope({ layoutMode : 'fitColumns' });
          }
      });
      
      t_thumbContainer = Tempo.prepare('thumbContainer').notify( function(event) {
          if (event.type === TempoEvent.Types.RENDER_STARTING) {

              
		/* $('#thumbContainer').imagesLoaded( function(){
        $(this).isotope({
          itemSelector : '.img',
		  layoutMode : 'masonry'
        });
      }); */
			  
         //$('#thumbContainer').isotope({ layoutMode : 'masonry' });
            
          };
          

      // if (event.type ===  TempoEvent.Types.RENDER_COMPLETE) {
            // $('#thumbContainer').isotope({
              // itemSelector : '.img',
              // layoutMode : 'masonry'
               // animationOptions: {
                 // duration: 750,
                 // easing: 'linear',
                 // queue: false
               // }
            // });

      
             // $('#thumbContainer .img').each(function() {
           // $('#thumbContainer').isotope('insert', $(this))
          // });
        // }

       });

      t_seriesContainer = Tempo.prepare('seriesContainer').notify( function(event) {
          if (event.type === TempoEvent.Types.RENDER_COMPLETE) {
			//$('#seriesContainer').isotope({ layoutMode : 'fitColumns' });
          }
      });
	  
	 t_queryContainer = Tempo.prepare('queryContainer').notify( function(event) {
          if (event.type === TempoEvent.Types.RENDER_COMPLETE) {
           // $('#topicsContainer').isotope({ layoutMode : 'fitColumns' });
          }
      });
  },
  retrieveData: function (searchObj, renderContainer, dataRequest, forcePost) {
	
	//attach usable localstorage data request value to render container for future child clicks
	$.jStorage.set(renderContainer.templates.container.id, dataRequest);
	

    // if the results dont exist already TODO: is this going to work with resubmitting new searches?
	if (forcePost == true) {
			 
	
			//prevent async on first call, or force it
        $.ajaxSetup({async:false});
          // make object values into strings
		  var handler = searchObj.handler;
			  
          if (searchObj.params.urlqs != undefined) {
            searchObj.params.urlqs = $.param(data.thumbnailQuery.results[0])
          }
	
		    var params = encodeURIComponent($.param(searchObj.params));

		      //submit search

			$.post('ba-simple-proxy.php?url='+handler+'?'+params).success(function(data) { //callback
				//push results to original searchObj for repeat use
				//this proxy mechanism returns results to a "contents" object
				searchObj.results = data.contents; 
				btj.renderTemplate(searchObj, renderContainer, dataRequest);
			});
			
      } else if (forcePost == false) {
            $.ajaxSetup({async:true});
            btj.renderTemplate(searchObj, renderContainer, dataRequest)
			}
	},
  
  renderTemplate: function (searchObj, renderContainer, dataRequest) {

	// render element
        var templateData = searchObj.results[dataRequest];
        var dataType = $.type(templateData)
		if (dataType == 'string') {
			templateData = $.parseJSON(templateData);
			$.each(templateData, function(i, val) {
				templateData = val
			});
		}
    
    if (dataRequest == 'images') { //use isotope
      //phillyhistory specific url field
/*        $(renderContainer.templates.container).isotope('destroy');
       $(renderContainer.templates.container).empty();
          $('#thumbContainer').isotope({
    itemSelector : '.img',
    layoutMode : 'masonry',
     masonry : {
          columnWidth : 120
        },
    animationEngine: 'best-available',
    animationOptions: {
     duration: 750,
     easing: 'linear',
     queue: true
   }

  }); */
       
       
       var theImg;
       $.each(templateData, function(i, val) {
           theImg += '<div class="img"><img src="http://phillyhistory.org/PhotoArchive/'+val.url+'"></div>';
          })
         $(renderContainer.templates.container).isotope( 'insert', $( theImg ) ); 

     // USE WAYPOINTS INSTEAD OF INFINITE SCROLL

 /*     $('#thumbContainer').infinitescroll({
 
    navSelector  : "div.navigation",            
                   // selector for the paged navigation (it will be hidden)
    nextSelector : "div.navigation a:first",    
                   // selector for the NEXT link (to page 2)
    itemSelector : "#thumbcontainer .img",
                   // selector for all items you'll retrieve
                   debug:true
  },
  function( theImg ) {
         $(renderContainer.templates.container).isotope( 'appended', $( theImg ) ); 
        }
  
  );  */
          
          
      //$(renderContainer.templates.container).imagesLoaded(function() {$(this).isotope('insert', $(theImg))});  
        }
    
    else { //use tempo
    renderContainer.starting();
		renderContainer.render(templateData);
    }
  }
}

$(function(){
	//unbind infinite scroll to work onclick
  //$(window).unbind('.infscr');
  
  
 
  
	btj.prepareTemplates();
	
   $('#thumbContainer').isotope({
    itemSelector : '.img',
    layoutMode : 'masonry',
     masonry : {
          columnWidth : 120
        },
    animationEngine: 'best-available',
    animationOptions: {
     duration: 750,
     easing: 'linear',
     queue: false
   }

  });
  
  
	btj.retrieveData(data.thumbnails, t_thumbContainer, 'images', true);
	
	btj.retrieveData(data.categories, t_seriesContainer, 'series', true);
	btj.retrieveData(data.categories, t_topicsContainer, 'topics', false);   
	
	btj.retrieveData(data.thumbnailQuery, t_queryContainer, 0, false);
	
	
	$('.panelTitle').tooltip({tipClass: 'topicsContainer', relative: true, position: 'bottom right', offset: [0,-100] });
	

  
    
  
  
  
  
  	$('.moreResults').click(function() {
    // trigger the next infinite scroll results
       // $(document).trigger('retrieve.infscr');
    })

  
		$('.searchCriteria a').click(function(){
			
			//get query request from dom storage of clicked item
			var dataQuery = $.jStorage.get($(this).closest('.searchCriteria').attr('id'));
			//clone previous query object and alter with new query request
				
			var newThumbnailQuery = $.extend(true, {}, data.thumbnailQuery.results[0]);
				newThumbnailQuery[dataQuery] = $(this).html();
				
				//get the additional query into the history object
				
				data.thumbnailQuery.results.unshift(newThumbnailQuery);
			
			//add new request to the top of the query object
		
			//$.merge(data.thumbnailQuery,newThumbnailQuery)
	
				
			
		
			
			//TODO:add new query to tagging
			//TODO: save thumbnailQueryHistory to localStorage

			  			t_thumbContainer.clear();
			btj.retrieveData(data.thumbnails, t_thumbContainer, 'images', true);
			
			
			
			//console.log(data.thumbnailQuery.results[0][dataQuery])
			
			
			btj.retrieveData(data.thumbnailQuery, t_queryContainer, 0, false);
	
		
				
		});

  });

