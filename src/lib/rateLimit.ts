import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
    count: number;
    resetTime: number;
}

const store = new Map<string, RateLimitStore>();

interface RateLimitOptions {
    interval: number;
    maxRequests: number;
    message?: string;
}

export function rateLimit(options: RateLimitOptions) {
    const { interval, maxRequests, message = "Too many requests" } = options;

    return async (req: NextRequest) => {
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ??
            req.headers.get("x-real-ip") ??
            "unknown";

        const key = `${req.nextUrl.pathname}:${ip}`;
        const now = Date.now();

        if (Math.random() < 0.01) {
            for (const [k, v] of store.entries()) {
                if (now > v.resetTime) {
                    store.delete(k);
                }
            }
        }

        const record = store.get(key);

        if (!record || now > record.resetTime) {
            store.set(key, {
                count: 1,
                resetTime: now + interval,
            });
            return null;
        }

        record.count++;

        if (record.count > maxRequests) {
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);
            return NextResponse.json(
                { error: message },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(retryAfter),
                        "X-RateLimit-Limit": String(maxRequests),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": String(Math.ceil(record.resetTime / 1000)),
                    },
                },
            );
        }

        store.set(key, record);
        return null;
    };
}

export const authRateLimit = rateLimit({
    interval: 1000 * 60 * 15, // 15 mins
    maxRequests: 5,
    message: "Too many login attempts. Please try again alter.",
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
