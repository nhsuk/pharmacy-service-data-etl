const xml2js = require('xml2js');
const stripPrefix = require('xml2js').processors.stripPrefix;

const PARSER_OPTIONS = {
  explicitArray: false,
  tagNameProcessors: [stripPrefix],
};

function createParser() {
  return new xml2js.Parser(PARSER_OPTIONS);
}

function xmlParser(xml) {
  return new Promise((resolve, reject) => {
    createParser().parseString(xml, (err, result) => {
      // eslint-disable-next-line no-unused-expressions
      err === null ? resolve(result) : reject(err);
    });
  });
}

module.exports = xmlParser;
