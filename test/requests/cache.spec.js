const chai = require('chai');
const sinon = require('sinon');
const should = chai.should();
const expect = chai.expect;
const Cache = require('../../util/cache');
const cache = new Cache();

const mochaAsync = fn => {
  return done => {
    fn.call().then(done, err => {
      done(err);
    });
  };
};

describe('# Global Cache', () => {
  context('cache system', () => {
    describe('Saving cache', () => {
      before(async () => {
        const data = { status: 'success', foo: function foo() {} };
        await cache.set('unitTest', data);
      });

      it(
        'foo should return with undefined',
        mochaAsync(async () => {
          let result = await cache.get('unitTest');
          expect(typeof result).to.equal('string');
          result = JSON.parse(result);
          expect(result.foo).to.equal(undefined);
        })
      );

      it(
        'should be able to set new Value to unitTest key',
        mochaAsync(async () => {
          await cache.set('unitTest', {
            status: 'success',
            message: 'unit testing'
          });
          let result = await cache.get('unitTest');
          expect(typeof result).to.equal('string');
          result = JSON.parse(result);
          expect(result.message).to.equal('unit testing');
        })
      );

      it(
        'should be able to flush all Value',
        mochaAsync(async () => {
          await cache.set('unitTest2', {
            status: 'success',
            message: 'unit testing'
          });
          let result = await cache.flushAll();
          expect(result).to.equal(true);
        })
      );

      after(async () => {
        await cache.del('unitTest');
      });
    });
  });
});
