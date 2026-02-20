import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { strictRateLimit } from "@/lib/rateLimit";

export async function PATCH(req: Request) {
    const limited = await strictRateLimit(req);
    if (limited) return limited;

    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 },
            );
        }

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const tokenRes = await pool.query(
            `SELECT user_id FROM auth_tokens
            WHERE token=$1 AND purpose='password_reset' AND expires_at > NOW()`,
            [tokenHash],
        );

        if (tokenRes.rowCount === 0) {
            return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 401 });
        }

        const userId = tokenRes.rows[0].user_id;
        const hashed = await bcrypt.hash(password, 12);

        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query("UPDATE users SET password=$1 WHERE id=$2", [hashed, userId]);
            await client.query(
                "DELETE FROM auth_tokens WHERE user_id=$1 AND purpose='password_reset'",
                [userId],
            );
            await client.query("COMMIT");
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("Reset password error:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
