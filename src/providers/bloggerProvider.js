
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var fs = require('fs');
var readline = require('readline');
var googleAuthorizer = require('../googleAuthorizer.js');

var bloggerProvider = function (blogId, clientSecretFilePath, tokenPath) {

	var blogId = blogId;

	if(!clientSecretFilePath || clientSecretFilePath.length <= 0 ||
		!tokenPath || tokenPath.length <= 0)
		throw new Error("Wrong arguments for blogger provider");

	var blog = google.blogger('v3');

	var module = {};

	var authorizer = new googleAuthorizer({
		clientSecretFilePath: clientSecretFilePath,
		tokenPath: tokenPath,
		scopes: ['https://www.googleapis.com/auth/blogger'],
	});

	module.getBlog = function(parameters, onSuccess, onError)  {

		var getTheBlog = function(auth) {

			var options = {
				auth: auth,
				blogId: blogId
			};

			if(parameters && parameters.maxResults && parameters.maxResults !== null && parameters.maxResults.length > 0) 
				options.maxResults = parameters.maxResults;

			if(parameters && parameters.pageToken && parameters.pageToken !== null && parameters.pageToken.length > 0) 
				options.pageToken = parameters.pageToken;

			blog.posts.list(options,  
			function(err, response) {
				if(err) {
					// Handle error
					onError && onError(err);
					return;
				}
				onSuccess && onSuccess(response);
			});
		}


		authorizer.authorizeForCallback(getTheBlog, onError);

	}

	return module;
};


module.exports = bloggerProvider;