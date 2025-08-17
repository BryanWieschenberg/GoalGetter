import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import SignupVerify from "@/lib/templates/SignupVerify";
import { Resend } from "resend";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { username, handle, email, password, confirmPassword, recaptchaToken } = await req.json();

        if (!recaptchaToken) {
            return NextResponse.json({ error: "Missing reCAPTCHA token" }, { status: 400 });
        }

        const verify = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${encodeURIComponent(process.env.RECAPTCHA_SECRET_KEY || "")}&response=${encodeURIComponent(recaptchaToken)}`
        });
        const data = await verify.json();

        if (!data.success || typeof data.score !== "number" || data.score < 0.5 || data.action !== "signup") {
            return NextResponse.json({ error: "Failed reCAPTCHA check" }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
        }

        const handleExists = await pool.query("SELECT 1 FROM users WHERE handle=$1", [handle]);
        if (handleExists.rowCount) {
            return NextResponse.json({ error: "Handle already in use" }, { status: 409 });
        }

        const emailExists = await pool.query("SELECT 1 FROM users WHERE email=$1", [email]);
        if (emailExists.rowCount) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        const hashed = await bcrypt.hash(password, 12);

        const userRes = await pool.query(
            `INSERT INTO users (username, handle, email, email_verified, password)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, username, email`,
            [username, handle, email, false, hashed]
        );
        const userId = userRes.rows[0].id;

        await pool.query(
            `INSERT INTO user_settings (user_id, theme)
            VALUES ($1, 'system')`,
            [userId]
        )

        const raw = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");

        await pool.query(
            `INSERT INTO auth_tokens (user_id, token, purpose, expires_at, created_at)
            VALUES ($1, $2, 'signup', now() + interval '1 hour', now())`,
            [userId, tokenHash]
        );
        const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

        const resend = new Resend(process.env.RESEND_API_KEY);
        const link = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${raw}`;
        
        await resend.emails.send({
            from: from,
            to: userRes.rows[0].email,
            subject: "Welcome to GoalGetter!",
            react: SignupVerify({ username: userRes.rows[0].username, link: link }),
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
