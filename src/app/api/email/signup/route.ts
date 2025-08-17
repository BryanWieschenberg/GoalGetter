import { NextResponse } from "next/server";
import { Resend } from "resend";
import SignupVerify from "@/lib/templates/SignupVerify";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { to, username, subject } = await req.json();

        if (!to || typeof to !== "string") {
            return NextResponse.json({ error: "Missing 'to' email" }, { status: 400 });
        }

        const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
        const raw = crypto.randomBytes(32).toString("hex");

        const resend = new Resend(process.env.RESEND_API_KEY);
        const link = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${raw}`;
        
        const result = await resend.emails.send({
            from,
            to,
            subject: subject,
            react: SignupVerify({ username, link }),
        });

        if (result.error) {
            return NextResponse.json({ error: result.error.message ?? "Send failed" }, { status: 502 });
        }

        return NextResponse.json({ id: result.data?.id }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
