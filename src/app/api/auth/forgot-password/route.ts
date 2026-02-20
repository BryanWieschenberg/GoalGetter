import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { Resend } from "resend";
import crypto from "crypto";
import PasswordResetVerify from "@/lib/templates/PasswordResetVerify";
import { strictRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
    const limited = await strictRateLimit(req);
    if (limited) return limited;

    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const userRes = await pool.query("SELECT id, username FROM users WHERE email=$1", [email]);

        if (userRes.rowCount === 0) {
            return NextResponse.json({ ok: true });
        }

        const user = userRes.rows[0];

        const tokenRes = await pool.query(
            `SELECT token, created_at FROM auth_tokens
            WHERE user_id=$1 AND purpose='password_reset'`,
            [user.id],
        );

        const raw = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");

        if (tokenRes.rowCount) {
            await pool.query(
                `UPDATE auth_tokens
                SET token=$1, created_at=NOW(), expires_at=NOW() + interval '1 hour'
                WHERE user_id=$2 AND purpose='password_reset'`,
                [tokenHash, user.id],
            );
        } else {
            await pool.query(
                `INSERT INTO auth_tokens (user_id, token, purpose)
                VALUES ($1, $2, 'password_reset')`,
                [user.id, tokenHash],
            );
        }

        const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
        const resend = new Resend(process.env.RESEND_API_KEY);
        const link = `${process.env.NEXT_PUBLIC_APP_URL}/password-reset?token=${raw}`;

        await resend.emails.send({
            from: from,
            to: email,
            subject: "Reset Your Password",
            react: PasswordResetVerify({ username: user.username, link: link }),
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
