const register = require('ignore-styles').default
// styles
const _ = require('lodash')
const bodyParser = require('body-parser')
const compression = require('compression')
const express = require('express')
const morgan = require('morgan')
const path = require('path')
const fs = require('fs')
const md5File = require('md5-file')

const mimeTypes = {
  '.jpg': 'image/jpeg'
, '.png': 'image/png'
}
register(undefined, (mod, filename) => {
  const ext = ['.png', '.jpg'].find(f=>filename.endsWith(f))
  if (!ext) return

  if (fs.statSync(filename).size < 10000) {
    const file = fs.readFileSync(filename).toString('base64')
    const mimeType = mimeTypes[ext] || 'image/jpg'
    mod.exports = `data:${mimeType};base64,${file}`
  } else {
    const hash = md5File.sync(filename).slice(0, 8)
    const bn = path.basename(filename).replace(/(\.\w{3})$/, `.${hash}$1`)
    mod.exports = `/static/media/${bn}`;
  }
})


var serverAppFactory = function(config) {
  var module = {}

  module.createExpressApp = function() {

    // routes
    const index = require('./routes/index');
    const webServicesApi = require('./routes/api');
    const universalLoader = require('./universal');

    // App setup
    const app = express();

    //COORS config
    app.use(function(req, res, next) {
      var allowedOrigins = [
        "http://localhost:3000"
      ];
      var origin = req.headers.origin;
      if(allowedOrigins.indexOf(origin) > -1){
           res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', true);
      return next();
    });

    //MIDDLEWARE
    //=============
    // Support Gzip
    app.use(compression());
    // Support post requests with body data (doesn't support multipart, use multer)
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    // Setup logger
    app.use(morgan('dev'));
    //=============

    //serve website
    //index is simply a router using the universal loader
    app.use('/', index(config));

    // Serve static assets
    app.use(express.static(config.staticAssetsLocation));

    //serve web services
    app.use('/api', webServicesApi(config));
    if(config.apiExpansion) {
      app.use('/api', config.apiExpansion(config));
    }

    // Always return the main index.html, so react-router render the route in the client
    app.use('/', new universalLoader(config));

    return app;
  }

  return module;
}


module.exports = serverAppFactory;

