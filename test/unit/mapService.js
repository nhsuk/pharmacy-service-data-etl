const chai = require('chai');
const fs = require('fs');

const mapService = require('../../app/lib/mappers/mapService');
const config = require('../../app/lib/config');

const expect = chai.expect;

function readFile(path) {
  return fs.readFileSync(path, 'utf8');
}

const rawService = readFile('test/resources/rawService.xhtml');

describe('mapService', () => {
  it('should map raw service JSON to preferred structure', () => {
    const id = 'cl223315';
    const service = mapService(id, rawService);
    expect(service.id).to.equal(id);
    expect(service.serviceType).to.equal(config.service);
    expect(service.odsCode).to.equal('FEE95');
  });
});
