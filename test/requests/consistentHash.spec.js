const chai = require('chai');
const sinon = require('sinon');
const should = chai.should();
const expect = chai.expect;
const {
  toUTF8Array,
  bytesToBigInt,
  jumpConsistentHash
} = require('../../util/consistentHash');

describe('# Jump Consistent Hashing', () => {
  context('# Hashing System', () => {
    describe('When request coming in', () => {
      const user1Request = '127.0.0.1:Roger1231';
      const user2Request = '192.168.0.3:Roger1231';
      const tBuckets = 4;
      let user1Bytes, user2Bytes;

      it('should return key bytes when we call the function', () => {
        user1Bytes = toUTF8Array(user1Request);
        expect(new Uint8Array(user1Bytes).toString()).to.equal('49,50,55,46,48,46,48,46,49,58,82,111,103,101,114,49,50,51,49');
      });

      it('should return key bytes when we call the function', () => {
        user2Bytes = toUTF8Array(user2Request);
        expect(new Uint8Array(user2Bytes).toString()).to.equal('49,57,50,46,49,54,56,46,48,46,51,58,82,111,103,101,114,49,50,51,49');
      });

      it('should return BigInt for mapping', () => {
        const user1BigInt = bytesToBigInt(user1Bytes);
        expect(typeof user1BigInt).to.equal('bigint');
      });

      it('should return mapping result which will indicate to bucket3', () => {
        const targetBucket = jumpConsistentHash(user1Request, tBuckets);
        expect(targetBucket).to.equal(3);
      });

      it('should return mapping result which will indicate to which bucket', () => {
        const targetBucket = jumpConsistentHash(user2Request, tBuckets);
        expect(targetBucket).to.equal(0);
      });
    });
  });
});