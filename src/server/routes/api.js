const express = require('express')
const router = express.Router()
const {MainApi} = require('../api')
const providerFactory = require('../providerFactory');

module.exports = function(config) {

	var providers = providerFactory(config);

	if(providers) {

		if(providers.mailProvider) {
			router.get('/v1/SendMail', (req, res) => {
			  providers.mailProvider.sendDefaultContactMail(req.query, function(resultMessage) {
			    res.json({result: resultMessage});
			  }, function(err) {
			    console.info(err);
			    res.status(500).end("mail send fail!: " + err);
			  })
			});

		}

		if(providers.facebookProvider) {

			router.get('/v1/GetFacebookEvents', (req, res) => {

			  providers.facebookProvider.getEvents(function(data) {
			    res.json(data);
			  }, function(err) {
			    console.info(err);
			    res.status(500).end("facebook events fetch fail!: " + err);
			  });

			});

			router.get('/v1/GetSingleFacebookEvent', (req, res) => {

			  providers.facebookProvider.getSingleEvent(req.query.eventId, function(data) {
			    res.json(data);
			  }, function(err) {
			    console.info(err);
			    res.status(500).end("facebook event fetch fail!: " + err);
			  });

			});

			router.get('/v1/GetFacebookEventPicture', (req, res) => {

			  providers.facebookProvider.getEventPicture(req.query.eventId, function(data) {
			    res.json(data);
			  }, function(err) {
			    console.info(err);
			    res.status(500).end("facebook event picture fetch fail!: " + err);
			  });
			});

			router.get('/v1/GetFacebookLiveStream', (req, res) => {

			  providers.facebookProvider.getLiveStream(function(data) {
			    res.json(data);
			  }, function(err) {
			    console.info(err);
			    res.status(500).end("facebook live stream fetch fail!: " + err);
			  });
			});


		}

		if(providers.eventbriteProvider) {

			router.get('/v1/GetEventbriteEvents', (req, res) => {

			  var additionalUsers = [];

			  if(req.query.additionalUsers && req.query.additionalUsers.length > 0) {
			    additionalUsers = req.query.additionalUsers.split(",");
			    additionalUsers = additionalUsers.filter(function(userId) {
			      return userId.length > 0;
			    });
			  }

			  providers.eventbriteProvider.GetUserEvents(additionalUsers, function(data) {
			    res.end(JSON.stringify(data));
			  }, function(error) {
			    console.log
			    res.status(500).end("Failed to get Events: " + error);
			  });

			});

			router.get('/v1/GetSingleEventbriteEvent', (req, res) => {
			  providers.eventbriteProvider.GetSingleEvent(req.query.eventId, function(data) {
			    res.end(JSON.stringify(data));
			  }, function(error) {
			    res.status(500).end("Failed to get Events: " + error);
			  });
			});


		}

		if(providers.bloggerProvider) {

			router.get('/v1/GetBlog', (req, res) => {
			  providers.bloggerProvider.getBlog(req.query, function(response) {
			    res.end(JSON.stringify(response));
			  }, function(err) {
			    res.status(500).end("Blog data fetch fail!: " + err);
			    console.info(err);
			  });
			});
		}

		if(providers.picasaProvider) {

			router.get('/v1/GetGalleryAlbums', (req, res) => {
			  providers.picasaProvider.getAlbums(function(response) {
			    res.end(JSON.stringify(response));
			  }, function(err) {
			    res.status(500).end("failed getting albums!: " + err);
			    console.info(err);
			  });
			});

			router.get('/v1/GetAlbumPhotos', (req, res) => {
			  providers.picasaProvider.getPhotos(req.query.albumId, function(response) {
			    res.end(JSON.stringify(response));
			  }, function(err) {
			    res.status(500).end("failed getting albums!: " + err);
			    console.info(err);
			  });
			});
		}

		if(providers.sheetsProvider) {
		}
		if(providers.driveProvider) {
		}
	}

	router.get('/', async function(req, res, next) {
	  const db = new MainApi()
	  const {text} = await db.getMain()
	  res.json({text, message: 'This came from the api'})
	})


	return router;
}
