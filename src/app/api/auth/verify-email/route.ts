import { NextResponse } from "next/server";
import pool from "@/lib/db";
import crypto from "crypto";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
        return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const res = await pool.query(
        `SELECT user_id, expires_at FROM auth_tokens WHERE token=$1`,
        [hashed]
    );
    const row = res.rows[0];
    if (!row) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (new Date(row.expires_at) < new Date()) {
        return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    await pool.query(`UPDATE users SET email_verified=true WHERE id=$1`, [row.user_id]);
    await pool.query(`DELETE FROM auth_tokens WHERE token=$1`, [hashed]);

    return NextResponse.json({ ok: true });
}
