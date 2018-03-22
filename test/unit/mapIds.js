const chai = require('chai');
const mapIds = require('../../app/lib/mappers/mapIds');

const expect = chai.expect;

describe('mapIds', () => {
  it('should map number from entry ID URL to IDs', () => {
    const results = {
      feed: {
        entry: [
          { id: 'http://v1.syndication.nhschoices.nhs.uk/services/types/srv0267/cl223315' },
          { id: 'http://v1.syndication.nhschoices.nhs.uk/services/types/srv0267/cl254299' }],
      },
    };

    const ids = mapIds(results);
    expect(ids.length).to.equal(2);
    expect(ids[0]).to.equal('cl223315');
    expect(ids[1]).to.equal('cl254299');
  });

  it('should gracefully handle missing entries', () => {
    const results = { feed: {} };

    const ids = mapIds(results);
    expect(ids.length).to.equal(0);
  });
});
