	//https://graph.facebook.com/v2.2/263827920387171/feed?access_token=1188261374526073|cU8UWhPPMAKNLosw_lzFMyEm6zQ
	
	 var Client = require('node-rest-client').Client;
	var request = require('request');
	var Promise = require('bluebird');
	var _ = require('underscore');
	//Url to fetch all feed data for the given URL since past 7 days
    exports.fetchFeed = function(req,res){
		
		var currentDate = new Date();
		var feedDateInMS = +new Date(currentDate);
		
		var sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		var sevenDaysAgoDateInMS = +new Date(sevenDaysAgo);
		if(feedDateInMS>sevenDaysAgoDateInMS){
		var url = req.body.urlToUse;
		getAllData(url).then(function(response){
			
			res.send(response);
		});
		}
	}
	//Url to giving popularity of represented room types for the given URL
	exports.avgPopularity = function(req,res){
		var votesForRent = 0;
		var votesForSharing = 0;
		var votesForOwner = 0;
		var url = 'https://graph.facebook.com/v2.2/263827920387171/feed?access_token=1188261374526073|cU8UWhPPMAKNLosw_lzFMyEm6zQ';
		getAllData(url).then(function(response){
		_.each(response.data,function(object){
			
			if(/\bowner\b/.test(object.message) || /\bOwner\b/.test(object.message) || /\bOWNER\b/.test(object.message) 
			|| /\bowner\n\b/.test(object.message) || /\b\nowner\b/.test(object.message)){
			
			votesForOwner++;
			
			}
			
			if(/\rent\b/.test(object.message) || /\bRent\b/.test(object.message) || /\bRENT\b/.test(object.message) 
			|| /\brent\n\b/.test(object.message) || /\b\nrent\b/.test(object.message)){
			
			votesForRent++
			
			}
			
			if(/\share/.test(object.message) || /\bShare/.test(object.message) || /\bSHARE\b/.test(object.message)
			|| /\bshare\n\b/.test(object.message)|| /\b\nshare\b/.test(object.message)){
			votesForSharing++
			}
		});
		var finalObject = {};
		finalObject.votesForRent = (votesForRent/(votesForRent+votesForSharing+votesForOwner))*100;
		finalObject.votesForSharing = (votesForSharing/(votesForRent+votesForSharing+votesForOwner))*100;
		finalObject.votesForOwner = (votesForOwner/(votesForRent+votesForSharing+votesForOwner))*100;
		return finalObject;
		}).then(function(finalObject){
			res.send(finalObject);
		})
	}
	
	//Url to giving frequency of represented room types for the given URL -- @ per hour 
	exports.avgFrequency = function(req,res){
		
		var votesForRent = 0;
		var votesForSharing = 0;
		var votesForOwner = 0;
		var allData = [];
		var ONE_HOUR = 60 * 60 * 1000; /* ms */
		var currentDate = new Date();
		var currentDateTimeInMs = +new Date(currentDate);
		
		var url = req.body.urlToUse;
		getAllData(url).then(function(response){
			_.each(response.data,function(postObject){
			var lastPostTime = postObject.updated_time
				lastPostTimeInMs = +new Date(lastPostTime);
				if ((currentDateTimeInMs - lastPostTimeInMs) < ONE_HOUR){
					allData.push(postObject);
				}
				});
			return response;
		}).then(function(response){
			
			return getAllData(response.paging.next);
		}).then(function(response){
				_.each(response.data,function(postObject){
				var lastPostTime = postObject.updated_time
				lastPostTimeInMs = +new Date(lastPostTime);
				if ((currentDateTimeInMs - lastPostTimeInMs) < ONE_HOUR){
					allData.push(postObject);
				}
				});
			return response;
		}).then(function(response){
		
			return getAllData(response.paging.next);
		}).then(function(response){
			_.each(response.data,function(postObject){
				var lastPostTime = postObject.updated_time
				lastPostTimeInMs = +new Date(lastPostTime);
				if ((currentDateTimeInMs - lastPostTimeInMs) < ONE_HOUR){
					allData.push(postObject);
				}
				
			});
			return response
		}).then(function(response){
			
			_.each(allData,function(object){
			
			if(/\bowner\b/.test(object.message) || /\bOwner\b/.test(object.message) || /\bOWNER\b/.test(object.message) 
			|| /\bowner\n\b/.test(object.message) || /\b\nowner\b/.test(object.message)){
			
			votesForOwner++;
			
			}
			
			if(/\rent\b/.test(object.message) || /\bRent\b/.test(object.message) || /\bRENT\b/.test(object.message) 
			|| /\brent\n\b/.test(object.message) || /\b\nrent\b/.test(object.message)){
			
			votesForRent++
			
			}
			
			if(/\share/.test(object.message) || /\bShare/.test(object.message) || /\bSHARE\b/.test(object.message)
			|| /\bshare\n\b/.test(object.message)|| /\b\nshare\b/.test(object.message)){
			votesForSharing++
			}
		});
		var finalObject = {};
		finalObject.postForRentperHour = votesForRent;
		finalObject.postForSharingperHour = votesForSharing;
		finalObject.postForOwnerperHour = votesForOwner;
		return finalObject;
		}).then(function(finalObject){
			res.send(finalObject);
		})
	}
	//Url to fetching comments annd likes
	exports.fetchComments = function(req,res){
	
		var finalResponseObject = {};
		var objectId = req.objectId;
		var url = req.body.urlToUseForComments;
		
		getAllData(url).then(function(commentsInfo){
		finalResponseObject.commentsInfo = commentsInfo;
		url = req.body.urlToUseForLikes;
		
		likesInfo = getAllData(url);
		return likesInfo;
		}).then(function(likesInfo){
		finalResponseObject.likesInfo = likesInfo;	
		return finalResponseObject;
		}).then(function(finalResponseObject){
			res.send(finalResponseObject);
		})
		
	}
	
	
	
	//Generic function to make an http request 
	var getAllData = function(url){
		
		
		return new Promise(function(resolve,reject){
		var client = new Client();
		
		client.get(url, function (data, response) {
		if(data.length == 0){
			
			
			reject();
		}	
		else{
		
		// parsed response body as js object 
		var response = JSON.parse(data);
		
		resolve(response);
		}
		}); 
		});
	}
	
	


