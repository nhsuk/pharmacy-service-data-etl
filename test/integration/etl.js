const chai = require('chai');
const fs = require('fs');
const moment = require('moment');
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

beforeEach(() => {
  etlStore.clearState();
});

describe('ETL', function test() {
  this.timeout(5000);

  it('should retrieve all ODS code', async () => {
    const lastModifiedDate = moment(config.initialLastRunDate);
    const ids = ['cl223315', 'cl254299'];
    const data = [];
    const dataDate = undefined;
    const dataService = mockDataService(data, dataDate, true);

    stubAllResults(lastModifiedDate);
    stubServiceLookup('test/resources/service-one.xhtml', ids[0]);
    stubServiceLookup('test/resources/service-two.xhtml', ids[1]);

    await etl.start(dataService);
    const records = etlStore.getRecords();
    expect(records.length).to.equal(2);
    expect(records[0].odsCode).to.equal('FEE95');
    expect(records[0].serviceType).to.equal('SRV0267');
    expect(records[1].odsCode).to.equal('FCW59');
    expect(records[0].serviceType).to.equal('SRV0267');
  });

  afterEach(() => {
    nock.cleanAll();
  });
});
