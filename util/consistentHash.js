const zero = 0n;
const shift = 8n;
const bigShift = 16n;
const byte = 255n;

/**
 * convert to string to binary code
 * @param {user IP:user Info} str
 * @returns {8 bits} bytes
 */
function unicodeToBinary (str) {
    const len = str.length;
    let n = zero;
    for (let i = 0; i < len; i++) {
        const bits = BigInt(str.codePointAt(i));
        n = (n << (bits > byte ? bigShift : shift)) + bits;
    }
    const bin = n.toString(2);
    return bin.padStart(8 * Math.ceil(bin.length / 8), 0);
}

/**
 * @param bytes 
 */
function bytesToBigInt(bytes) {
    const high = 
        bytes[0] * 2 ** 24 +
        bytes[1] * 2 ** 16 +
        bytes[2] * 2 ** 8 +
        bytes[3];
    const low = 
        bytes[4] * 2 ** 24 +
        bytes[5] * 2 ** 16 +
        bytes[6] * 2 ** 8 +
        bytes[7];
    
    return (BigInt(high) << 32n) + BigInt(low);
}

/**
 * 
 * @param {Uint8Array} key 8 bytes (represents unit64 number)
 * @param {number} buckets
 * 
 * @return {number} Bucket from `[0, buckets]` range
 */
function jumpConsistentHash(key, buckets) {
    let keyBigInt = bytesToBigInt(key);
    let b = -1n;
    let j = 0n;
    while (j < buckets) {
        b = j;
        keyBigInt = (keyBigInt * 2862933555777941757n) % (2n ** 64n) + 1n;
        j = BigInt(Math.floor((Number(b) + 1) * Number(1n << 31n) / Number((keyBigInt >> 33n) + 1n)));
    }
    return Number(b);
}

module.exports = { unicodeToBinary, bytesToBigInt, jumpConsistentHash };