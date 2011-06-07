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
          
                $('#thumbContainer').isotope({
                  itemSelector : '.img',
                  layoutMode : 'masonry'
                });

              if (event.type ===  TempoEvent.Types.RENDER_COMPLETE) {

                   $(this).isotope('insert', $('#thumbContainer'))

                }

          
 
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

			$.post('ba-simple-proxy.php?url='+handler+'?'+params, function(data) { //callback
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
		renderContainer.render(templateData);
	
  }
}

$(function(){
	
	btj.prepareTemplates();
	
	
	btj.retrieveData(data.thumbnails, t_thumbContainer, 'images', true);
	
	btj.retrieveData(data.categories, t_seriesContainer, 'series', true);
	btj.retrieveData(data.categories, t_topicsContainer, 'topics', false);   
	
	btj.retrieveData(data.thumbnailQuery, t_queryContainer, 0, false);
	
	
	$('.panelTitle').tooltip({tipClass: 'topicsContainer', relative: true, position: 'bottom right', offset: [0,-100] });
	
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

