// 1. token bucket algo (standard in industry)
const tokenBucketMap = new Map();
const MAX_TOKENS = 5;
const REFILL_INTERVAL = 2000; // Refill 1 token every 2 seconds (2000ms)

export function rateLimitter1(req, res, next) {
    const ip = req.ip;
    const now = Date.now();

    if (!tokenBucketMap.has(ip)) {
        tokenBucketMap.set(ip, {
            tokens: MAX_TOKENS,
            lastRefillTime: now
        });
    }

    const bucket = tokenBucketMap.get(ip);

    // Calculate elapsed time and add accrued tokens
    const elapsedTime = now - bucket.lastRefillTime;
    const tokensToAdd = Math.floor(elapsedTime / REFILL_INTERVAL);

    if (tokensToAdd > 0) {
        bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + tokensToAdd);
        bucket.lastRefillTime = bucket.lastRefillTime + (tokensToAdd * REFILL_INTERVAL);
    }

    // Check if we have at least 1 token
    if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        return next();
    } else {
        return res.status(429).send("too many requests");
    }
}


// 2. sliding window Log algo
const MAX_SIZE = 30;
const TTL = 60_000; // 10 seconds
const logBucket = new Map();

export default function rateLimitter(req, res, next) {
    const ip = req.ip;

    if (!logBucket.has(ip)) logBucket.set(ip, new Set());
    const currIpBucket = logBucket.get(ip);

    // freeing the window from all the exipred logs
    const now = Date.now();
    while (currIpBucket.size > 0) {
        const item = currIpBucket.values().next().value;

        if (now - item > TTL) {
            // ttl has passed for the i'th request made by that ip
            currIpBucket.delete(item); // freeing the space from the window
        } else break;
    }

    if (currIpBucket.size >= MAX_SIZE) {
        return res.status(429).send("too many requests");
    } else {
        currIpBucket.add(now);
        return next();
    }
}
