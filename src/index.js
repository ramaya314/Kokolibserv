/*
Guide:
https://hackernoon.com/building-a-react-component-library-part-2-46fd4f77bb5c

*/

//server assets
import mailProvider from './providers/mailProvider';
import eventbriteProvider from './providers/eventbriteProvider';
import googleSheetsProvider from './providers/googleSheetsProvider';
import picasaProvider from './providers/picasaProvider';


module.exports = {
  mailProvider,
  eventbriteProvider,
  googleSheetsProvider,
  picasaProvider
}