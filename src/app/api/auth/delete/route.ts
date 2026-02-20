import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { strictRateLimit } from "@/lib/rateLimit";
import { withAuth } from "@/lib/authMiddleware";

export const DELETE = withAuth(async (req, userId) => {
    const limited = await strictRateLimit(req);
    if (limited) return limited;

    const result = await pool.query("DELETE FROM users WHERE id=$1", [userId]);

    if (result.rowCount === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
});
