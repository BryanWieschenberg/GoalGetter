import { NextResponse } from "next/server";
import { authRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
    const limited = await authRateLimit(req);
    if (limited) {
        return limited;
    }

    const { token } = await req.json();

    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await res.json();
    if (
        !data.success ||
        typeof data.score !== "number" ||
        data.score < 0.5 ||
        data.action !== "signin"
    ) {
        return NextResponse.json({ error: "Failed reCAPTCHA check" }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
}
