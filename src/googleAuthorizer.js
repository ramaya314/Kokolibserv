
var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var readline = require('readline');


/*options looks like this
{
	clientSecretFilePath: "",
	tokenPath: "",
	scopes: [],
}
*/
var googleAuthorizer = function (options) {

	var module = {};

	module.authorizeForCallback = function (callback, onError) {


		// Load client secrets from a local file.
		fs.readFile(options.clientSecretFilePath, function processClientSecrets(err, content) {
			if (err) {
				onError && onError('Error loading client secret file: ' + err);
				return;
			}
			// Authorize a client with the loaded credentials, then call the
			// Google Sheets API.
			authorize(JSON.parse(content), callback);
		});
	}

	/**
	* Create an OAuth2 client with the given credentials, and then execute the
	* given callback function.
	*
	* @param {Object} credentials The authorization client credentials.
	* @param {function} callback The callback to call with the authorized client.
	*/
	function authorize(credentials, callback) {
		var clientSecret = credentials.installed.client_secret;
		var clientId = credentials.installed.client_id;
		var redirectUrl = credentials.installed.redirect_uris[0];
		var auth = new googleAuth();
		var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

		// Check if we have previously stored a token.
		fs.readFile(options.tokenPath, function(err, token) {
			if (err) {
				getNewToken(oauth2Client, callback);
			} else {
				var tokenError = false;
				try {
					oauth2Client.credentials = JSON.parse(token);
				} catch(e) {
					tokenError = true;
				}

				var expirationDate = null;
				var now = new Date(Date.now());
				try {
					expirationDate = new Date(oauth2Client.credentials.expiry_date);
				} catch(e) {
					tokenError = true;
				}

				if(!expirationDate || expirationDate <= now || tokenError) {
					console.log("Found expired credentials:\n");
					console.log(oauth2Client.credentials);
					console.log("Renewing...\n");

					oauth2Client.refreshAccessToken(function(err, tokens) {
						if (err) {
							console.log('Error while trying to renew access token', err);
							console.log('Getting new access token...');
							getNewToken(oauth2Client, callback);
							return;
						}
						oauth2Client.credentials = tokens;
						storeToken(tokens);
						callback(oauth2Client);
					});
				} else {
					callback(oauth2Client);
				}
			}
		});
	}

	/**
	* Get and store new token after prompting for user authorization, and then
	* execute the given callback with the authorized OAuth2 client.
	*
	* @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
	* @param {getEventsCallback} callback The callback to call with the authorized
	*     client.
	*/
	function getNewToken(oauth2Client, callback) {
		var authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: options.scopes
		});
		console.log('Authorize this app by visiting this url: ', authUrl);
		var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		rl.question('Enter the code from that page here: ', function(code) {
			rl.close();
			oauth2Client.getToken(code, function(err, token) {
				if (err) {
					console.log('Error while trying to retrieve access token', err);
					return;
				}
				oauth2Client.credentials = token;
				storeToken(token);
				callback(oauth2Client);
			});
		});
	}

	var storing = false;
	/**
	* Store token to disk be used in later program executions.
	*
	* @param {Object} token The token to store to disk.
	*/
	function storeToken(token, tries = 0) {
		if(storing)
			return;

		storing = true;

		if(tries > 30) {
			console.log("token failed to write the allowed number of times. Token: \n" + token);
			storing = false;
			return;
		}

		fs.writeFile(options.tokenPath, JSON.stringify(token), function (err) {
	    if (!err)
	      fs.readFile(options.tokenPath, 'utf-8', function (err2, data) {
	        if (!err2) {
						try{
								var tokenJson = JSON.parse(data);
								console.log('Token correctly stored to ' + options.tokenPath);
								storing = false;
						} catch (e) {
							console.log("Token json corrupted. Saving again. Token: \n" + tokenJson)
							storing = false;
							storeToken(token, ++tries);
						}
					}
	      })
	  });
	}

	return module;
};


module.exports = googleAuthorizer;
