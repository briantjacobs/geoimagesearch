var data = {  

   topics: {
      handler :'SearchStream',
      params: {request: 'all'},
      dataRequest: 'topics',
      },
      
   series: {
      handler :'SearchStream',
      params: {request: 'all'},
      dataRequest: 'series',
      },
}

var btj = {
	//http://api.jquery.com/serialize/

  
  doSearch: function (searchObj, elementId) {
      //setup template element, test for rendering
      var element = Tempo.prepare(elementId).notify(function(event) {
      if (event.type === TempoEvent.Types.RENDER_STARTING || event.type ===     TempoEvent.Types.RENDER_COMPLETE) {
        $(elementId).toggleClass('loading');
        }
      });
      element.starting();
      
      // make object values into strings
      var handler = searchObj.handler;
      var params = $.param(searchObj.params);
      
      //submit search
      $.post('ba-simple-proxy.php?url=http://phillyhistory.org/PhotoArchive/'+handler+'.ashx?'+params, function(data) {
        var theData = $.parseJSON(data.contents[searchObj.dataRequest]);
      //render the data into the template
        $.each(theData, function(i, val) {
          element.render(val);
        });
      });
      

		},
  
  renderTemplate: function (theData, elementID) {


  },
  
  
	renderTopics: function () {

    var topics = Tempo.prepare('topics').notify(function(event) {
    if (event.type === TempoEvent.Types.RENDER_STARTING || event.type === TempoEvent.Types.RENDER_COMPLETE) {
        $('ol').toggleClass('loading');
      }
    });
    topics.starting();

    $.post("ba-simple-proxy.php?url=http://phillyhistory.org/PhotoArchive/SearchStream.ashx?request=all", function(data) {
        var theData = $.parseJSON(data.contents.topics);
        console.log(theData);
        $.each(theData, function(i, val) {
          console.log(val);
          topics.render(val);
      });
		});

  } 
}

$(function(){
  //btj.renderTopics();
    btj.doSearch(data.topics, 'topics');
      btj.doSearch(data.series, 'series');
  });

