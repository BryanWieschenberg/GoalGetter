import { NextResponse } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";

export async function POST(req: Request) {
    const client = await pool.connect();
    let began = false;

    try {
        const { token } = await req.json();
        if (!token) {
            return NextResponse.json({ error: "missing_token" }, { status: 400 });
        }

        const hashed = crypto.createHash("sha256").update(token).digest("hex");

        await client.query("BEGIN");
        began = true;

        const res = await client.query(
            `SELECT user_id
             FROM auth_tokens
             WHERE token=$1 AND purpose='signup' AND expires_at > NOW()
             LIMIT 1`,
            [hashed],
        );

        if (!res.rowCount) {
            await client.query("ROLLBACK");
            return NextResponse.json({ error: "invalid_or_expired" }, { status: 400 });
        }

        const userId = res.rows[0].user_id;

        await client.query(`UPDATE users SET email_verified=true WHERE id=$1`, [userId]);
        await client.query(`DELETE FROM auth_tokens WHERE token=$1`, [hashed]);

        await client.query("COMMIT");
        began = false;

        return NextResponse.json({ ok: true });
    } catch (e) {
        if (began) {
            await client.query("ROLLBACK");
        }
        console.error("Error verifying email:", e);
        return NextResponse.json({ error: "server_error" }, { status: 500 });
    } finally {
        client.release();
    }
}
