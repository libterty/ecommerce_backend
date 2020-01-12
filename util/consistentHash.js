// can referencing my open source https://www.npmjs.com/package/jump-consistent-hash 
const zero = BigInt(0);
const shift = BigInt(8);
const bigShift = BigInt(16);
const byte = BigInt(255);

/**
 * @param {user IP:user Info} str
 * @return {byte array}
 */
function toUTF8Array(str) {
  var utf8 = [];
  for (var i = 0; i < str.length; i++) {
    var charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(
        0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    } else {
      i++;
      charcode =
        0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }
  return utf8;
}

/**
 * @param bytes
 */
function bytesToBigInt(bytes) {
  const high =
    bytes[0] * 2 ** 24 + bytes[1] * 2 ** 16 + bytes[2] * 2 ** 8 + bytes[3];
  const low =
    bytes[4] * 2 ** 24 + bytes[5] * 2 ** 16 + bytes[6] * 2 ** 8 + bytes[7];

  return (BigInt(high) << BigInt(32)) + BigInt(low);
}

/**
 *
 * @param {Uint8Array} key 8 bytes
 * @param {number} buckets
 *
 * @return {number} Bucket from `[0, buckets]` range
 */
function jumpConsistentHash(key, buckets) {
  let strToArr = toUTF8Array(key);
  let keyBigInt = bytesToBigInt(strToArr);
  let b = BigInt(-1);
  let j = BigInt(0);
  while (j < buckets) {
    b = j;
    keyBigInt =
      ((keyBigInt * BigInt(2862933555777941757)) % BigInt(2) ** BigInt(64)) +
      BigInt(1);
    j = BigInt(
      Math.floor(
        ((Number(b) + 1) * Number(BigInt(1) << BigInt(31))) /
          Number((keyBigInt >> BigInt(33)) + BigInt(1))
      )
    );
  }
  return Number(b);
}

module.exports = { toUTF8Array, bytesToBigInt, jumpConsistentHash };

