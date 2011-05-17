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
  
  retrieveData: function (searchObj, renderContainer, dataRequest) {

    // if the results dont exist already TODO: is this going to work with resubmitting new searches?
		 if (searchObj.results == undefined) {
			//prevent async on first call
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
	
	//	Tempo.prepare(renderContainer).clear();

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
						          renderContainer.render(val)
						  		});
        } else {
        
  
        
        renderContainer.render(templateData);
        }

				//console.log(templateData)
           // element.render(templateData);
							 //render the data into the template


		         

  },
  
}

$(function(){
var thumbContainer = Tempo.prepare('thumbContainer');
var seriesContainer = Tempo.prepare('seriesContainer');

  //btj.renderTopics();
  // btj.doSearch(data.topics);
//$('body').html(data.categories);

  // btj.retrieveData(data.categories, 'topicsContainer', 'topics');
 //  btj.retrieveData(data.categories, 'seriesContainer', 'series');
   btj.retrieveData(data.thumbnails, thumbContainer, 'images');
   btj.retrieveData(data.categories, seriesContainer, 'topics');
   

  });

