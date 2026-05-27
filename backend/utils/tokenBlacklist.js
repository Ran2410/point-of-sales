/**
 * Token blacklist dengan Redis sebagai primary storage.
 * Fallback ke in-memory Set jika Redis tidak tersedia.
 * TTL = 8 jam (sama dengan JWT_EXPIRES_IN default)
 */
import redis, { redisOk } from "../configs/redis.js";

const memoryFallback = new Set();
const TTL_SECONDS    = 8 * 60 * 60; // 8 jam

const add = async (token) => {
    if (redisOk) {
        try {
            await redis.set(`bl:${token}`, 1, "EX", TTL_SECONDS);
            return;
        } catch { /* fallback */ }
    }
    memoryFallback.add(token);
};

const has = async (token) => {
    if (redisOk) {
        try {
            return (await redis.get(`bl:${token}`)) !== null;
        } catch { /* fallback */ }
    }
    return memoryFallback.has(token);
};

export default { add, has };
