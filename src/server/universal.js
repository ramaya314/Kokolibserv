

const path = require('path')
const fs = require('fs')
const os = require('os')


var universalLoader = function(config) {
  var module = {}

  const api = require('./api')
  var render = config.renderer;
  var renderHead =config.headRenderer;
  
  // this does most of the heavy lifting
  async function serverRender(req, res, htmlData){

    //console.log('server render 1');
    //console.log(req);
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

    const context = {data: {}, head: [], req, api}

    const store = config.storeConfigurator();
    // first
    render(req, store, context)

    //console.log('server render 2');
    if (context.url) {
      // Somewhere a `<Redirect>` was rendered
      res.redirect(301, context.url)
    }

    // handle our data fetching
    const keys = Object.keys(context.data)
    const promises = keys.map(k=>context.data[k])
    const resolved = await Promise.all(promises)
    resolved.forEach((r,i)=>context.data[keys[i]]=r)

    //second
    const markup = render(req, store, context)
    const headMarkup = renderHead(context)


    //console.log('server render 2');
    if (context.url) {
      // Somewhere a `<Redirect>` was rendered
      res.redirect(301, context.url)
    } else {
      // we're good, add in markup, send the response
      const RenderedApp = htmlData.replace('{{SSR}}', markup)
                                  .replace('<meta-head/>', headMarkup)
                                  .replace('{{data}}', new Buffer(JSON.stringify(context.data)).toString('base64'))

    //console.log('server render 3');

      if (context.code)
        res.status(context.code);

      res.send(RenderedApp);

    //console.log('server render 4');
    //console.log(markup);
    }
  }

  return function universalLoader(req, res) {
    const filePath = config.indexLocation;

    //console.log("got a request");

    fs.readFile(filePath, 'utf8', (err, htmlData)=>{
      //console.log('read file');
      if (err) {
        console.error('read err', err)
        return res.status(404).end()
      }

      serverRender(req, res, htmlData)
        .catch(err=>{
          console.error('Render Error', err)
          return res.status(500).json({message: 'Render Error'})
        })
    })
  }
}

module.exports = universalLoader
