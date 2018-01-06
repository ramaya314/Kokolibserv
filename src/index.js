/*
Guide:
https://hackernoon.com/building-a-react-component-library-part-2-46fd4f77bb5c

*/

//server assets
import mailProvider from './providers/mailProvider';
import eventbriteProvider from './providers/eventbriteProvider';
import googleSheetsProvider from './providers/googleSheetsProvider';
import picasaProvider from './providers/picasaProvider';
import bloggerProvider from './providers/bloggerProvider';
import facebookProvider from './providers/facebookProvider';
import instagramProvider from './providers/instagramProvider';
import KokoServer from './server';
import providerFactory from './server/providerFactory';


module.exports = {
  mailProvider,
  eventbriteProvider,
  googleSheetsProvider,
  picasaProvider,
  bloggerProvider,
  facebookProvider,
  instagramProvider,
  providerFactory,
  KokoServer
}