import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { apiRateLimit } from "@/lib/rateLimit";
import { withAuth } from "@/lib/authMiddleware";
import { validate, validationError, THEMES, WEEK_STARTS } from "@/lib/validate";

interface UserSettings {
    theme: string;
    week_start: string;
}

export const GET = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    const result = await pool.query<UserSettings>(
        "SELECT theme, week_start FROM user_settings WHERE user_id=$1",
        [userId],
    );

    if (result.rowCount === 0) {
        return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
});

export const PUT = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    await pool.query(`UPDATE user_settings SET theme=$1, week_start=$2 WHERE user_id=$3`, [
        "system",
        "sun",
        userId,
    ]);

    return NextResponse.json({ ok: true });
});

export const PATCH = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    const body: UserSettings = await req.json();

    const err = validate([
        { field: "theme", value: body.theme, required: true, type: "string", enum: THEMES },
        {
            field: "week_start",
            value: body.week_start,
            required: true,
            type: "string",
            enum: WEEK_STARTS,
        },
    ]);
    if (err) return validationError(err);

    await pool.query(`UPDATE user_settings SET theme=$1, week_start=$2 WHERE user_id=$3`, [
        body.theme,
        body.week_start,
        userId,
    ]);

    return NextResponse.json({ ok: true });
});
