
var api = require('instagram-node').instagram();

var instagramProvider = function (options) {

	//========DEFAULTS AND OPTIONS EXTENSIONS================
	var defaults = {
		clientId: "",
		clientSecret: ""
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

	api.use({ client_id: this.options.clientId, client_secret: this.options.clientSecret });


	module.getFeed = function(onSuccess, onError)  {
		
		onSuccess({});
		
	}

	return module;
};


module.exports = instagramProvider;