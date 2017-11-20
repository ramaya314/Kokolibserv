
var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var readline = require('readline');
var googleAuthorizer = require('../googleAuthorizer.js');
const Picasa = require('./picasa/picasa.js');
 
//picasa documentation:
//https://github.com/esteban-uo/picasa

//The picasa module has been extracted from the node_modules folder
//to the /server/picasa folder to prevent overwrite of the hack that provides the album thumbnail.

var picasaProvider = function (clientSecretFilePath, tokenPath, blackList) {

	if(!clientSecretFilePath || clientSecretFilePath.length <= 0 ||
		!tokenPath || tokenPath.length <= 0)
		throw new Error("Wrong arguments for picasa provider");

	const picasa = new Picasa();

	var authorizer = new googleAuthorizer({
		clientSecretFilePath: clientSecretFilePath,
		tokenPath: tokenPath,
		scopes: ['https://picasaweb.google.com/data/'],
	});

	const defaultBlackList = [
		'Auto Backup',
		'Profile Photos',
		'Scrapbook Photos',
		'Youtube Channel Art',
		'2014-10-28',
		'2013-10-22'
	];

	if(blackList && blackList != null){
		blackList =	defaultBlackList.concat(blackList)
	} else blackList = defaultBlackList; 



	var module = {};

	module.getAlbums = function(onSuccess, onError)  {


		var getTheAlbums = function(auth) {

			const options = {}

			let exec = (accessToken) => {

				picasa.getAlbums(accessToken, options, (error, albums) => {

					if(error) {
						onError(error);
						return;
					}

					if(albums.length == 0) {
						onSuccess(albums);
						return;
					}

					for(var i = 0, l = albums.length; i < l; i++) {
						let album = albums[i];

						if(album.num_photos <= 0 ) {
							albums.splice(albums.indexOf(album), 1);
							i--;
							l--;
							continue;
						}

						for(var j = 0; j < blackList.length; j++) {
							if(blackList[j].toLowerCase() === album.title.toLowerCase()) {
								albums.splice(albums.indexOf(album), 1);
								i--;
								l--;
								continue;
							}
						}
					}

					onSuccess(albums);

				});
			};

			exec(auth.credentials.access_token);

		}

		authorizer.authorizeForCallback(getTheAlbums, onError);
	}

	module.getPhotos = function(albumId, onSuccess, onError) {
		var getThePhotos = function(auth) {
			
			let photos = picasa.getPhotos(auth.credentials.access_token, { albumId: albumId }, (error, photos) => {
				photos && onSuccess(photos);
				error && onError(error);
			});
		}

		authorizer.authorizeForCallback(getThePhotos, onError);
	}

	return module;
};


module.exports = picasaProvider;



