import { NextResponse } from "next/server";
import pool from "@/lib/db";
import crypto from "crypto";
import { Resend } from "resend";
import SignupResendVerify from "@/lib/templates/SignupResendVerify";
import { strictRateLimit } from "@/lib/rateLimit";
import { withAuth } from "@/lib/authMiddleware";

export const POST = withAuth(async (req, userId) => {
    const limited = await strictRateLimit(req);
    if (limited) {
        return limited;
    }

    try {
        const userRes = await pool.query(
            "SELECT username, email, email_verified FROM users WHERE id=$1",
            [userId],
        );
        const user = userRes.rows[0];
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        if (user.email_verified) {
            return NextResponse.json({ error: "Email already verified" }, { status: 400 });
        }

        const tokenRes = await pool.query(
            `SELECT token, created_at FROM auth_tokens
            WHERE user_id=$1 AND purpose='signup'
            ORDER BY created_at DESC LIMIT 1`,
            [userId],
        );

        if (tokenRes.rowCount) {
            const createdAt = new Date(tokenRes.rows[0].created_at).getTime();
            const elapsedMs = Date.now() - createdAt;
            const cooldownMs = 60_000;
            if (elapsedMs < cooldownMs) {
                const remainingSec = Math.ceil((cooldownMs - elapsedMs) / 1000);
                return NextResponse.json(
                    { error: "cooldown", remaining: remainingSec },
                    { status: 429 },
                );
            }
        }

        const raw = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");

        if (tokenRes.rowCount) {
            await pool.query(
                `UPDATE auth_tokens
                SET token=$1, created_at=NOW(), expires_at=NOW() + interval '1 hour'
                WHERE user_id=$2 AND purpose='signup'`,
                [tokenHash, userId],
            );
        } else {
            await pool.query(
                `INSERT INTO auth_tokens (user_id, token, purpose)
                VALUES ($1, $2, 'signup')`,
                [userId, tokenHash],
            );
        }

        const to = user.email;
        const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
        const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${raw}`;

        const resend = new Resend(process.env.RESEND_API_KEY);
        const result = await resend.emails.send({
            from,
            to,
            subject: "Verify Your Email",
            react: SignupResendVerify({ username: user.username, link: verifyLink }),
        });

        if (result.error) {
            return NextResponse.json(
                { error: result.error.message ?? "Send failed" },
                { status: 502 },
            );
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
});
