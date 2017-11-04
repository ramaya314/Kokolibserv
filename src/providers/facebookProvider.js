var graph = require('fbgraph');
var fs = require('fs');
var readline = require('readline');


/*

https://developers.facebook.com/tools/explorer
https://developers.facebook.com/tools/accesstoken/

https://developers.facebook.com/tools/debug/accesstoken/

*/

var facebookProvider = function (options) {

	//========DEFAULTS AND OPTIONS EXTENSIONS================
	var defaults = {
		appSecret: "",
		accessToken: "",
		tokenPath: "",
		appId: "",
		entityId: "me"
	}
	//Set default parameters and default configurations
	var extendDefaults = function(source, properties) {
		var property;
		for (property in properties) {
			if (properties.hasOwnProperty(property)) {
				source[property] = properties[property];
			}
		}
		return source;
	}
	if(arguments.length <= 0) {
		this.options = defaults;
	} else if (arguments[0] && typeof arguments[0] === "object") {
		this.options = extendDefaults(defaults, arguments[0]);
	}

	var module = {};
	var that = this;

	graph.setAccessToken(this.options.accessToken);

	module.getEvents = function(onSuccess, onError)  {
		
		graph.get(that.options.entityId + "?fields=events", function(err, resp) {
			if(err) {
				onError && onError(err);
				return;
			}
			onSuccess && onSuccess(resp);
		});
		
	}

	module.getSingleEvent = function(eventId, onSuccess, onError)  {
		
		graph.get(eventId, function(err, resp) {
			if(err) {
				onError && onError(err);
				return;
			}
			onSuccess && onSuccess(resp);
		});
		
	}

	module.getEventPicture = function(eventId, onSuccess, onError) {
		graph.get(eventId + "/picture?type=large", function(err, resp) {
			if(err) {
				onError && onError(err);
				return;
			}
			onSuccess && onSuccess(resp);
		});
	}

	var refreshAccessToken = function() {
		graph.extendAccessToken({
			//"access_token":   that.options.accessToken,
			"client_id":      that.options.appId,
			"client_secret":  that.options.appSecret
		}, function (err, facebookRes) {

			//if(err)
			//	console.log(err);

			console.log(facebookRes);
		});
	}

	return module;
};


module.exports = facebookProvider;