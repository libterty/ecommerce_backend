const redis = require('redis');
const REDIS_CACHE_URL =
  process.env.NODE_ENV === 'production'
    ? 'redis://h:p66a0fd9f2276df8f3a52b7f269a60e34ac42a3508ab3742d544ddbca1ec86311@ec2-54-152-118-90.compute-1.amazonaws.com:8919'
    : 'redis://127.0.0.1:6379';
let client = redis.createClient(REDIS_CACHE_URL);

class Cache {
    get(key) {
        return new Promise(async (resolve, reject) => {
            try {
                await client.get(key, (err, data) => {
                    if (err) throw err;
                    resolve (
                        data
                    );
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    set(key, value) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(
                    await client.MSET(key, JSON.stringify(value))
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    del(key) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(
                    await client.del(key)
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    flushAll(key) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(
                    await client.flushall()
                );
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = Cache;