const redis = require('redis');
const REDIS_CACHE_URL = process.env.NODE_ENV !== 'development' ? 'redis://h:p66a0fd9f2276df8f3a52b7f269a60e34ac42a3508ab3742d544ddbca1ec86311@ec2-54-152-118-90.compute-1.amazonaws.com:8919' : 'redis://127.0.0.1:6379';
let client = redis.createClient(REDIS_CACHE_URL);

const cacheController = {
    cacheTest: (req, res, next) => {
        client.get('cachetest', (err, data) => {
            if (err) throw err;
            if (data !== null) {
                res.status(200).json(JSON.parse(data));
            } else {
                next();
            }
        });
    },
    cacheAdminProducts: (req, res, next) => {
        client.get('adminProducts', (err, data) => {
            if (err) throw err;
            if (data !== null) {
                res.status(200).json(JSON.parse(data));
            } else {
                next();
            }
        });
    },
    cacheAdminProduct: (req, res, next) => {
        client.get(`adminProduct:${req.params.id}`, (err, data) => {
            if (err) throw err;
            if (data !== null) {
                res.status(200).json(JSON.parse(data));
            } else {
                next();
            }
        });
    }
}

module.exports = cacheController;