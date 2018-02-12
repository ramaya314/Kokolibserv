//original base code which this is derived from can be found here
//https://github.com/ayroblu/ssr-cra-v2.1

const path = require('path')
const fs = require('fs')
const os = require('os')

var universalLoader = function(config) {
  var module = {}

  // this does most of the heavy lifting
  async function serverRender(req, res, htmlData, initialStore){

    //hack to temprorarly define browser globals on the serer
    if (!process.env.BROWSER) {
      global.window = {
        location: {
          protocol:req.protocol,
          hostname:os.hostname()
        }
      }; 
      global.document = {createElement: function() {}};
    }

    const context = {data: {}, head: [], req}
    const store = config.storeConfigurator(initialStore || null);


    //render the app
    const markup = config.renderer(req, store, context)


    if (context.url) {
      // Somewhere a `<Redirect>` was rendered
      res.redirect(301, context.url)
    } else {
      // we're good, add in markup, send the response
      const RenderedApp = htmlData.replace('{{SSR}}', markup)
                                  .replace('<meta-head/>', context.head)
                                  .replace('{{data}}', new Buffer(JSON.stringify(store.getState())).toString('base64'))

      if (context.code)
        res.status(context.code);

      res.send(RenderedApp);

    }
  }


  return function universalLoader(req, res) {
    const filePath = config.indexLocation;

    //console.log("got a request   " + req.originalUrl);

    fs.readFile(filePath, 'utf8', (err, htmlData)=>{
      //console.log('read file');
      if (err) {
        console.error('read err', err)
        return res.status(404).end()
      }

      if(config.initialStoreFetcher) { //if we have an initial store state retriever get that first
        config.initialStoreFetcher(config, function(initialStore) {
          serverRender(req, res, htmlData, initialStore)
            .catch(err=>{
              console.error('Render Error', err)
              return res.status(500).json({message: 'Render Error: ' + err})
            })
        });
      } else { //otherwise just render
        serverRender(req, res, htmlData)
          .catch(err=>{
            console.error('Render Error', err)
            return res.status(500).json({message: 'Render Error: ' + err})
          })
      }


    })
  }
}

module.exports = universalLoader
