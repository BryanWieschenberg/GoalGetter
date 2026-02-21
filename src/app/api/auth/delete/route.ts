import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import { strictRateLimit } from "@/lib/rateLimit";
import { withAuth } from "@/lib/authMiddleware";

export const DELETE = withAuth(async (req, userId) => {
    const limited = await strictRateLimit(req);
    if (limited) {
        return limited;
    }

    try {
        const body = await req.json().catch(() => ({}));
        const { password } = body;

        const userRes = await pool.query("SELECT password, provider FROM users WHERE id=$1", [
            userId,
        ]);

        if (userRes.rowCount === 0) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = userRes.rows[0];

        if (user.provider === "inapp") {
            if (!password) {
                return NextResponse.json({ error: "Password is required" }, { status: 400 });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
            }
        }

        await pool.query("DELETE FROM users WHERE id=$1", [userId]);

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("Account deletion error:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
});
