import { NextResponse } from "next/server";
import redis from "@/lib/redis";

interface RateLimitOptions {
    interval: number;
    maxRequests: number;
    message?: string;
}

export function rateLimit(options: RateLimitOptions) {
    const { interval, maxRequests, message = "Too many requests" } = options;

    return async (req: Request) => {
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ??
            req.headers.get("x-real-ip") ??
            "unknown";

        const pathname = new URL(req.url).pathname;
        const key = `rl:${pathname}:${ip}`;
        const now = Date.now();
        const windowStart = now - interval;

        try {
            const pipeline = redis.pipeline();

            pipeline.zremrangebyscore(key, 0, windowStart);
            pipeline.zcard(key);
            pipeline.zadd(key, now, `${now}:${Math.random()}`);
            pipeline.pexpire(key, interval);

            const results = await pipeline.exec();

            const count = results?.[1]?.[1] as number;

            if (count >= maxRequests) {
                const oldestInWindow = await redis.zrange(key, 0, 0, "WITHSCORES");
                const oldestTimestamp =
                    oldestInWindow.length >= 2 ? Number(oldestInWindow[1]) : now;
                const retryAfter = Math.ceil((oldestTimestamp + interval - now) / 1000);

                return NextResponse.json(
                    { error: message },
                    {
                        status: 429,
                        headers: {
                            "Retry-After": String(Math.max(1, retryAfter)),
                            "X-RateLimit-Limit": String(maxRequests),
                            "X-RateLimit-Remaining": "0",
                            "X-RateLimit-Reset": String(
                                Math.ceil((oldestTimestamp + interval) / 1000),
                            ),
                        },
                    },
                );
            }

            return null;
        } catch (err) {
            console.error("Rate limit Redis error:", err);
            return null;
        }
    };
}

export const authRateLimit = rateLimit({
    interval: 1000 * 60 * 15, // 15 mins
    maxRequests: 5,
    message: "Too many login attempts. Please try again later.",
});

export const apiRateLimit = rateLimit({
    interval: 1000 * 60, // 1 min
    maxRequests: 60,
    message: "API rate limit exceeded.",
});

export const strictRateLimit = rateLimit({
    interval: 1000 * 60 * 60, // 1 hr
    maxRequests: 60,
    message: "Rate limit exceeded. Please try again later.",
});
