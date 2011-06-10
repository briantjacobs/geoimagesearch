//TODO: render new queries into their own dynamic containers.  show relevant headers. make isotope faster when appending a lot of things...


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
       
       t_thumbContainer2 = Tempo.prepare('thumbContainer2');

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
          
         $(renderContainer.templates.container).isotope( 'insert', $( theImg ) )

     // USE WAYPOINTS INSTEAD OF INFINITE SCROLL -- infinite scroll wants to do a get, not a post

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
  },
  refreshThumbs : function(options) {
	      //clear isotope
      $(t_thumbContainer.templates.container).isotope('remove', $(t_thumbContainer.templates.container).children());
			//rerender thumbs
      btj.retrieveData(data.thumbnails, t_thumbContainer, 'images', true);
			
      //TODO:add new query to tagging
			//TODO: save thumbnailQueryHistory to localStorage
			//console.log(data.thumbnailQuery.results[0][dataQuery])
  },
 appendHistory : function(dataKey, dataValue) { //TODO: allow this to accept multiple key/value pairs
 		
        //clone previous query object and alter with new query request				
        var newThumbnailQuery = $.extend(true, {}, data.thumbnailQuery.results[0]);
				newThumbnailQuery[dataKey] = dataValue;
				//get the additional query into the history object
				data.thumbnailQuery.results.unshift(newThumbnailQuery);
 }

}

$(function(){
	//unbind infinite scroll to work onclick
  //$(window).unbind('.infscr');
  
  
  var queryAdditions = []
  
	btj.prepareTemplates();
	
   $('#thumbContainer, #thumbContainer2').isotope({
    itemSelector : '.img',
    layoutMode : 'masonry',
     masonry : {
          columnWidth : 120
        },
    animationEngine: 'best-available',
    animationOptions: {
     duration: 5000,
     easing: 'linear',
     queue: true
   }

  });
  
  // USE object option notation for setting options
  
	btj.retrieveData(data.thumbnails, t_thumbContainer, 'images', true);
	
	btj.retrieveData(data.categories, t_seriesContainer, 'series', true);
	btj.retrieveData(data.categories, t_topicsContainer, 'topics', false);   
	
	btj.retrieveData(data.thumbnailQuery, t_queryContainer, 0, false);
	
	
	$('.panelTitle').tooltip({tipClass: 'topicsContainer', relative: true, position: 'bottom right', offset: [0,-100] });
	

  
    
  
  
  
  
  	$('.more').click(function() {
        // start the thumbs beyond the previous fetch point
        data.thumbnails.params.start = data.thumbnails.params.limit + data.thumbnails.params.start + 1;

        
        btj.retrieveData(data.thumbnails, t_thumbContainer2, 'images', true);
        // append more results onto current criteria
    })

  
		$('.searchCriteria a').click(function(){ //TODO: allow storage of number of images fetched?
      //get query request from dom storage of clicked item, set to search history, 
			btj.appendHistory($.jStorage.get($(this).closest('.searchCriteria').attr('id')), $(this).html());
      btj.refreshThumbs(queryAdditions);
    
  
  
  
  
  // WAYPOINTS
  /* var $loading = $("<div class='loading'><p>Loading more items&hellip;</p></div>"),
	$footer = $('footer'),
	opts = {
		offset: '100%'
	};
	
	$footer.waypoint(function(event, direction) {
		$footer.waypoint('remove');
		$('body').append($loading);
    $('#topicsContainer a:first').click()
    
		//	$footer.waypoint(opts);
	}, opts); */

  
  
		
				
		});

  });

