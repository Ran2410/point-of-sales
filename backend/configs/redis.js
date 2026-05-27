import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: 1,
    lazyConnect         : true,
    enableOfflineQueue  : false,
    retryStrategy       : () => null, // jangan retry — langsung fallback ke memory
});

let redisOk = false;

redis.connect()
    .then(() => { redisOk = true; console.log("Redis connected"); })
    .catch(() => { /* silent — fallback ke memory */ });

redis.on("connect", () => { redisOk = true; });
redis.on("error",   () => { redisOk = false; }); // silent, tidak log ke console

export { redisOk };
export default redis;
