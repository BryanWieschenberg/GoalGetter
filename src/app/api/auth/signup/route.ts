import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

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
            RETURNING id`,
            [username, handle, email, false, hashed]
        );
        const userId = userRes.rows[0].id;

        await pool.query(
            `INSERT INTO user_settings (user_id, theme, timezone, notifications_enabled)
            VALUES ($1, 'system', 'EST', true)`,
            [userId]
        )

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
