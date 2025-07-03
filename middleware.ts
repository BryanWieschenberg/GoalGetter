import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    console.log("🔒 Middleware triggered");
    const authHeader = req.headers.get("authorization");

    if (authHeader) {
        const [scheme, encoded] = authHeader.split(" ");
        if (scheme === "Basic") {
            const [_username, password] = atob(encoded).split(":");
            console.log("🔐 Password received:", password);
            if (password === process.env.DEPLOY_PASS) {
                return NextResponse.next();
            }
        }
    }

    console.warn("❌ Unauthorized access attempt");
    return new Response("Unauthorized", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="Access to this app"',
        },
    });
}
