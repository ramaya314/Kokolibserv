const bloggerProvider = require('../providers/bloggerProvider');
const eventbriteProvider = require('../providers/eventbriteProvider');
const facebookProvider = require('../providers/facebookProvider');
const instagramProvider = require('../providers/instagramProvider');
const googleDriveProvider = require('../providers/googleDriveProvider');
const googleSheetsProvider = require('../providers/googleSheetsProvider');
const picasaProvider = require('../providers/picasaProvider');
const mailProvider = require('../providers/mailProvider');
const nodemailer = require('nodemailer');


module.exports = function(config) {

	var providers = {};
	if(config.mail) {
		providers.mailProvider = new mailProvider(nodemailer.createTransport(config.mail));
	}
	if(config.facebook) {
		providers.facebookProvider = new facebookProvider({
			accessToken: config.facebook.accessToken,
			entityId: config.facebook.entityId
		});
	}
	if(config.instagram) {
		providers.instagramProvider = new instagramProvider({
			clientId: config.instagram.clientId,
			clientSecret: config.instagram.clientSecret
		});
	}
	if(config.eventbrite) {
		providers.eventbriteProvider = new eventbriteProvider(config.eventbrite.authToken);
	}
	if(config.google) {
		if(config.google.blogger)
			providers.bloggerProvider = new bloggerProvider(config.google.blogger.blogId, config.google.clientSecretLocation, config.google.blogger.tokenPath);
		if(config.google.photos) 
			providers.picasaProvider = new picasaProvider(config.google.clientSecretLocation, config.google.photos.tokenPath, config.google.photos.blackList);
		if(config.google.sheets)
			providers.sheetsProvider = new googleSheetsProvider(config.google.clientSecretLocation, config.google.sheets.tokenPath);
		if(config.google.drive)
			providers.driveProvider = new googleDriveProvider(config.google.clientSecretLocation, config.google.drive.tokenPath);
	}
	return providers
}