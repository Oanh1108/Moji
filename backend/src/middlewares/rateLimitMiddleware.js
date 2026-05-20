const buckets = new Map();

const cleanupExpiredBuckets = (now) => {
    for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetAt <= now) {
            buckets.delete(key);
        }
    }
}

export const createRateLimiter = ({
    windowMs = 60_000,
    max = 60,
    message = "Qua nhieu request, vui long thu lai sau"
} = {}) => {
    return (req, res, next) => {
        try {
            const now = Date.now();

            if (buckets.size > 10_000) {
                cleanupExpiredBuckets(now);
            }

            const userId = req.user?._id?.toString() ?? "anonymous";
            const routeKey = req.originalUrl?.split("?")[0] ?? req.path ?? "unknown";
            const key = `${req.ip}:${userId}:${req.method}:${routeKey}`;
            const bucket = buckets.get(key);

            if (!bucket || bucket.resetAt <= now) {
                buckets.set(key, {
                    count: 1,
                    resetAt: now + windowMs
                });

                res.setHeader("X-RateLimit-Limit", max);
                res.setHeader("X-RateLimit-Remaining", max - 1);
                return next();
            }

            if (bucket.count >= max) {
                const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);

                res.setHeader("Retry-After", retryAfter);
                return res.status(429).json({message});
            }

            bucket.count += 1;

            res.setHeader("X-RateLimit-Limit", max);
            res.setHeader("X-RateLimit-Remaining", Math.max(max - bucket.count, 0));
            return next();
        } catch (error) {
            console.error("Rate limiter error", error);
            return next();
        }
    }
}
