const chai = require('chai');
const sinon = require('sinon');
const should = chai.should();
const expect = chai.expect;
const { unicodeToBinary, bytesToBigInt, jumpConsistentHash } = require('../../util/consistentHash');

describe('# Jump Consistent Hashing', () => {
    context('# Hashing System', () => {
        describe('When request coming in', () => {
            const user1Request = '127:0.0.1:1:user1';
            const tBuckets = 4;
            let user1Bytes;

            it('should return bytes when we call the function for Key', () => {
                user1Bytes = unicodeToBinary(user1Request);
                expect(user1Bytes).to.equal('0011000100110010001101110011101000110000001011100011000000101110001100010011101000110001001110100111010101110011011001010111001000110001');
            });

            it('should return BigInt for mapping', () => {
                const user1BigInt = bytesToBigInt(user1Bytes);
                expect(typeof user1BigInt).to.equal('bigint');
            });

            it('should return mapping result which will indicate to which bucket', () => {
                const targetBucket = jumpConsistentHash(user1Bytes, tBuckets);
                expect(targetBucket).to.equal(1);
            });
        });
    });
});