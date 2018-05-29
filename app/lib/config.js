const version = require('../../package').version;

const service = process.env.SYNDICATION_SERVICE;
const syndicationUrl = process.env.SYNDICATION_URL || 'http://v1.syndication.nhschoices.nhs.uk';
const config = {
  containerName: process.env.CONTAINER_NAME || 'etl-output',
  etlName: process.env.ETL_NAME,
  hitsPerHour: process.env.HITS_PER_HOUR || 20000,
  idKey: 'id',
  outputDir: './output',
  outputFile: process.env.OUTPUT_FILE,
  service,
  syndicationApiUrl: `${syndicationUrl}/services/types/${service}`,
  version,
};

module.exports = config;

