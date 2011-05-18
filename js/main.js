var data = {  

   categories: {
      handler :'SearchStream',
      params: {request: 'all'},
      },

   thumbnails: {
      handler :'Thumbnails',
      params: {	
        limit: 12,
        noStore: false,
        request: 'Images',
        start: 0,
        urlqs: {}
			}
      },

   thumbnailQuery: {
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
   }
      
}

var btj = {
  prepareTemplates: function() {
  
      topicsContainer = Tempo.prepare('topicsContainer').notify( function(event) {
          if (event.type === TempoEvent.Types.RENDER_COMPLETE) {
            $('#topicsContainer').isotope({ layoutMode : 'fitColumns' });
          }
      });
      
      thumbContainer = Tempo.prepare('thumbContainer');
      
      seriesContainer = Tempo.prepare('seriesContainer').notify( function(event) {
          if (event.type === TempoEvent.Types.RENDER_COMPLETE) {
            $('#seriesContainer').isotope({ layoutMode : 'fitColumns' });
          }
      });;
  },
  retrieveData: function (searchObj, renderContainer, dataRequest, forcePost) {
	
	//attach usable localstorage data request value to render container for future child clicks
	$.jStorage.set(renderContainer.templates.container.id, dataRequest);
	

    // if the results dont exist already TODO: is this going to work with resubmitting new searches?
		  if (searchObj.results == undefined || forcePost == true) {
			//prevent async on first call, or force it
          $.ajaxSetup({async:false});
          // make object values into strings
          var queryUrl = '';
		      var handler = searchObj.handler;
          if (searchObj.params.urlqs != undefined) {
            searchObj.params.urlqs = $.param(data.thumbnailQuery)
          }
		      var params = encodeURIComponent($.param(searchObj.params));

		      //submit search

		      			$.post('ba-simple-proxy.php?url=http://phillyhistory.org/PhotoArchive/'+handler+'.ashx?'+params, function(data) {
		   						//var theData = $.parseJSON(data.contents[searchObj.dataRequest]);

									//push results to original searchObj
									searchObj.results = data; 
									btj.renderTemplate(searchObj, renderContainer, dataRequest);

		      					});
      	} else {
            $.ajaxSetup({async:true});
            btj.renderTemplate(searchObj, renderContainer, dataRequest)
	
   
			}
	},
  
  renderTemplate: function (searchObj, renderContainer, dataRequest) {

	// render element
        var templateData = searchObj.results.contents[dataRequest];
        var dataType = $.type(templateData)

		        if (dataType == 'string') {
								templateData = $.parseJSON(templateData);
		            $.each(templateData, function(i, val) {
								    templateData = val
                });
            }
		        renderContainer.render(templateData);
  },
 
  
}

$(function(){
	

	
	
btj.prepareTemplates();





btj.retrieveData(data.thumbnails, thumbContainer, 'images');
btj.retrieveData(data.categories, seriesContainer, 'series');
btj.retrieveData(data.categories, topicsContainer, 'topics');   


	$('.searchCriteria a').click(function(){
		var dataQuery = $.jStorage.get($(this).closest('.searchCriteria').attr('id'));				    
		data.thumbnailQuery[dataQuery] = $(this).html();
		//TODO:add new query to tagging
		//TODO: save thumbnailQuery to localStorage
		thumbContainer.clear();
		btj.retrieveData(data.thumbnails, thumbContainer, 'images', true);
	});

  });

