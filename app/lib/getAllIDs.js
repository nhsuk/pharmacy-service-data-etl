const service = require('./syndicationService');
const mapIds = require('./mappers/mapIds');

async function getAllIDs() {
  const pageJson = await service.getAll();
  return mapIds(pageJson);
}

module.exports = getAllIDs;
