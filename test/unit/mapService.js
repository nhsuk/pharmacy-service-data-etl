const chai = require('chai');
const fs = require('fs');
const mapService = require('../../app/lib/mappers/mapService');

const expect = chai.expect;

function readFile(path) {
  return fs.readFileSync(path, 'utf8');
}

const rawService = readFile('test/resources/rawService.xhtml');

describe('mapService', () => {
  it('should map raw service JSON to preferred structure', () => {
    const service = mapService(rawService);
    expect(service.serviceType).to.equal('SRV0267');
    expect(service.odsCode).to.equal('FEE95');
  });
});
