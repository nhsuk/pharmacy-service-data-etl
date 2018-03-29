const chai = require('chai');

const utils = require('../../app/lib/utils');

const expect = chai.expect;

describe('utils', () => {
  describe('asArray', () => {
    it('should return an array as an array', () => {
      const arrayIn = [1, 2, 3];
      const array = utils.asArray(arrayIn);
      expect(array.length).to.equal(3);
      expect(array[0]).to.equal(1);
      expect(array[1]).to.equal(2);
      expect(array[2]).to.equal(3);
    });

    it('should return an object as an array', () => {
      const objectIn = 1;
      const array = utils.asArray(objectIn);
      expect(array.length).to.equal(1);
      expect(array[0]).to.equal(1);
    });
  });
});
