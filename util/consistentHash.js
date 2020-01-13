// can referencing my open source https://www.npmjs.com/package/jump-consistent-hash
const { jumpConsistentHash } = require('jump-consistent-hash');
const address1 = '127.0.0.1:Roger1231';
const tBucket = 4;

const targetBucket = jumpConsistentHash(address1, tBucket);
console.log('targetBucket', targetBucket);
