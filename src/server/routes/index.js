const express = require('express')
const router = express.Router()


module.exports = function(config) {

	const universalLoader = require('../universal')

	router.get('/', new universalLoader(config))

	return router;
}
