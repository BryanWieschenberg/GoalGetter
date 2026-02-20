import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { apiRateLimit } from "@/lib/rateLimit";
import { withAuth } from "@/lib/authMiddleware";

export const GET = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    try {
        const categories = await pool.query(
            `SELECT *
            FROM event_categories
            WHERE user_id = $1
            ORDER BY id ASC`,
            [userId],
        );

        return NextResponse.json({ categories: categories.rows }, { status: 200 });
    } catch (e) {
        console.error("GET /api/user/calendar/categories:", e);
        return NextResponse.json(
            { error: "Failed to fetch calendar categories." },
            { status: 500 },
        );
    }
});

export const POST = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    try {
        const body = await req.json();
        const payload = body.payload;
        const { name, color } = payload;

        await pool.query(
            `INSERT INTO event_categories (user_id, name, color)
            VALUES ($1, $2, $3)
            RETURNING id, name, color`,
            [userId, name, color || null],
        );

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (e) {
        console.error("POST /api/user/calendar/categories error:", e);
        return NextResponse.json({ error: "Failed to add calendar category." }, { status: 500 });
    }
});

export const PUT = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    try {
        const body = await req.json();
        const payload = body.payload;
        const { id, title, color } = payload;

        const result = await pool.query(
            `UPDATE event_categories
            SET name = $1, color = $2
            WHERE id = $3 AND user_id = $4
            RETURNING id, name, color`,
            [title, color || null, id, userId],
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ ok: true, category: result.rows[0] }, { status: 200 });
    } catch (e) {
        console.error("PUT /api/user/calendar/categories error:", e);
        return NextResponse.json({ error: "Failed to update calendar category." }, { status: 500 });
    }
});

export const DELETE = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        const result = await pool.query(
            `DELETE FROM event_categories
            WHERE id = $1 AND user_id = $2
            RETURNING id`,
            [id, userId],
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (e) {
        console.error("DELETE /api/user/calendar/categories error:", e);
        return NextResponse.json({ error: "Failed to delete calendar category." }, { status: 500 });
    }
});
