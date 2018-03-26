const config = require('../config');

const regex = /<dt>ODS Code:<\/dt>[\s]*<dd>(.*)<\/dd>/;

function getOdsCode(page) {
  const match = page.match(regex);
  return match && match[1];
}

function mapService(id, rawService) {
  return {
    id,
    odsCode: getOdsCode(rawService),
    serviceType: config.service,
  };
}

module.exports = mapService;
