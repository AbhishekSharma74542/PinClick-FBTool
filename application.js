	var express = require('express');
	var app     = express();
	var bodyParser = require('body-parser')
	var path    = require("path");
	var rssFeed = require('C:/Users/ABHIS/Documents/NestAwayTool/RSSFEED.js');

	
	app.use(bodyParser.urlencoded({ extended: false }))
	 
	
	app.use(bodyParser.json())

	//All end points -->	
	app.get('/',function(req,res){
	  res.sendFile(path.join('C:/Users/ABHIS/Documents/NestAwayTool'+'/index.html'));
	});
	app.put('/allFeeds', rssFeed.fetchFeed);
	app.put('/allComments', rssFeed.fetchComments);
	app.put('/avgPopularity', rssFeed.avgPopularity);
	app.put('/avgFrequency', rssFeed.avgFrequency);
	
	
	


	var server = app.listen(8082,function(){
	   console.log('express server listening on port ' + server.address().port);
	});