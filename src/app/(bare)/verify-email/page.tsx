import { redirect } from "next/navigation";
import crypto from "crypto";
import pool from "@/lib/db";

export default async function VerifyEmailPage({ searchParams }: { searchParams: { token: string } }) {
    const token = searchParams.token;
    let msg = "Invalid token";
    
    if (!token) {
        msg = "No token provided";
        return (<div className="p-8">{msg}</div>);
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const res = await pool.query(
        `SELECT user_id, expires_at FROM auth_tokens WHERE token=$1`,
        [hashed]
    );
    const row = res.rows[0];
    if (!row) {
        msg = "No token found in records";
        return (<div className="p-8">{msg}</div>);
    }

    if (new Date(row.expires_at) < new Date()) {
        msg = "Token expired";
        return (<div className="p-8">{msg}</div>);
    }

    await pool.query(`UPDATE users SET email_verified=true WHERE id=$1`, [row.user_id]);
    await pool.query(`DELETE FROM auth_tokens WHERE token=$1`, [hashed]);

    return (<div className="p-8">{msg}</div>);
}
