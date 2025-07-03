import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const authHeader = req.headers.get("authorization");

    if (authHeader) {
        const [scheme, encoded] = authHeader.split(" ");
        if (scheme === "Basic") {
            const [_username, password] = atob(encoded).split(":");
            if (password === process.env.DEPLOY_PASS) {
                return NextResponse.next();
            }
        }
    }

    return new Response("Unauthorized", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="Access to this app"',
        },
    });
}
