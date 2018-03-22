const chai = require('chai');
const fs = require('fs');
const nock = require('nock');

const config = require('../../app/lib/config');
const service = require('../../app/lib/syndicationService');

const expect = chai.expect;

function readFile(path) {
  return fs.readFileSync(path, 'utf8');
}

function stubAllResults(filePath) {
  const url = `/all.xml?apikey=${process.env.SYNDICATION_API_KEY}`;
  const stubbedData = readFile(filePath);
  nock(config.syndicationApiUrl)
    .get(url)
    .reply(200, stubbedData);
}

describe('Syndication Service', () => {
  it('should throw error if syndication returns html', async () => {
    stubAllResults('test/resources/error.html');
    try {
      await service.getAllPage();
      chai.assert.fail('should have thrown exception');
    } catch (ex) {
      expect(ex).to.exist;
    }
  });
});

