const request = require('request-promise-native');
const xmlParser = require('./xmlParser');
const config = require('./config');

const API_KEY = process.env.SYNDICATION_API_KEY;
const SYNDICATION_HTML_PAGE_ERROR = 'Syndication XML page is returning HTML - server error';

function rejectHtml(json) {
  // in some cases if there is an error on a syndication page an HTML error page is returned
  // but with response type as 200 and a content-type of xml..
  // reject the page if the top tag is called html
  if (json.html) {
    throw new Error(SYNDICATION_HTML_PAGE_ERROR);
  }
  return json;
}

function getService(id) {
  const url = `${config.syndicationApiUrl}/${id}.xhtml?apikey=${API_KEY}`;
  return request.get(url);
}

function getAll() {
  const url = `${config.syndicationApiUrl}/all.xml?apikey=${API_KEY}`;
  return request.get(url).then(xmlParser).then(rejectHtml);
}

module.exports = {
  getAll,
  getService,
};
