const promisify = require('util').promisify;
const xml2js = require('xml2js');

const stripPrefix = xml2js.processors.stripPrefix;

const parser = new xml2js.Parser({
  explicitArray: false,
  tagNameProcessors: [stripPrefix],
});

const parse = promisify(parser.parseString);

function xmlParser(xml) {
  return parse(xml);
}

module.exports = xmlParser;
