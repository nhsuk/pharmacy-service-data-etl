const chai = require('chai');
const fs = require('fs');
const nock = require('nock');

const expect = chai.expect;

const etl = require('../../app/lib/etl');
const etlStore = require('etl-toolkit').etlStore;
const config = require('../../app/lib/config');

function mockDataService(data, date, expectUpload) {
  return {
    getLatestData: () => new Promise(resolve => resolve({ data, date })),
    uploadData: () => new Promise((resolve, reject) => (expectUpload ? resolve(true) : reject(new Error('Upload data should not have been called')))),
    uploadSummary: () => new Promise((resolve, reject) => (expectUpload ? resolve(true) : reject(new Error('Upload summary should not have been called')))),
  };
}

function readFile(path) {
  return fs.readFileSync(path, 'utf8');
}

function stubAllResults() {
  const stubbedAllRecords = readFile('test/resources/all-records.xml');
  const url = `/all.xml?apikey=${process.env.SYNDICATION_API_KEY}`;
  nock(config.syndicationApiUrl)
    .get(url)
    .reply(200, stubbedAllRecords);
}

function stubServiceLookup(filePath, id) {
  const stubbedData = readFile(filePath);
  nock(config.syndicationApiUrl)
    .get(`/${id}.xhtml?apikey=${process.env.SYNDICATION_API_KEY}`)
    .reply(200, stubbedData);
}

function stubErrorLookup(id) {
  nock(config.syndicationApiUrl)
    .get(`/${id}.xhtml?apikey=${process.env.SYNDICATION_API_KEY}`)
    .reply(500, '500 error');
}

beforeEach(() => {
  etlStore.clearState();
});

describe('ETL', function test() {
  this.timeout(5000);

  it('should retrieve all ODS code', async () => {
    const ids = ['cl223315', 'cl254299', 'cl199416'];
    const data = [];
    const dataDate = undefined;
    const dataService = mockDataService(data, dataDate, true);

    stubAllResults();
    stubServiceLookup('test/resources/service-one.xhtml', ids[0]);
    stubServiceLookup('test/resources/service-two.xhtml', ids[1]);
    stubServiceLookup('test/resources/service-three.xhtml', ids[2]);

    await etl.start(dataService);
    const records = etlStore.getRecords();
    expect(records.length).to.equal(3);
    expect(records[0].id).to.equal(ids[0]);
    expect(records[0].odsCode).to.equal('FEE95');
    expect(records[0].serviceType).to.equal(config.service);
    expect(records[1].id).to.equal(ids[1]);
    expect(records[1].odsCode).to.equal('FCW59');
    expect(records[1].serviceType).to.equal(config.service);
    expect(records[2].id).to.equal(ids[2]);
    expect(records[2].odsCode).to.equal('FAM93');
    expect(records[2].serviceType).to.equal(config.service);
  });

  it('should keep list of failed IDs', async () => {
    const ids = ['cl223315', 'cl254299', 'cl199416'];
    const data = [];
    const dataDate = undefined;
    const dataService = mockDataService(data, dataDate, true);

    stubAllResults();
    stubServiceLookup('test/resources/service-one.xhtml', ids[0]);
    stubErrorLookup(ids[1]);
    stubServiceLookup('test/resources/service-three.xhtml', ids[2]);

    await etl.start(dataService);
    const records = etlStore.getRecords();
    expect(records.length).to.equal(2);
    expect(records[0].odsCode).to.equal('FEE95');
    expect(records[0].serviceType).to.equal(config.service);
    expect(records[1].odsCode).to.equal('FAM93');
    expect(records[1].serviceType).to.equal(config.service);
    expect(etlStore.getErorredIds()[0]).to.equal('cl254299');
  });

  afterEach(() => {
    nock.cleanAll();
  });
});
