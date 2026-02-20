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
            FROM task_categories
            WHERE user_id = $1
            ORDER BY sort_order, id`,
            [userId],
        );

        return NextResponse.json({ categories: categories.rows }, { status: 200 });
    } catch (err) {
        console.error("GET /api/user/tasks/categories error:", err);
        return NextResponse.json({ error: "Failed to fetch task categories." }, { status: 500 });
    }
});

export const POST = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    try {
        const body = await req.json();
        const payload = body.payload;
        const { title, color } = payload;

        const { rows: maxRows } = await pool.query(
            `SELECT COALESCE(MAX(sort_order) + 1, 0) AS next_order
            FROM task_categories
            WHERE user_id = $1`,
            [userId],
        );
        const nextOrder = maxRows[0].next_order;

        const category = await pool.query(
            `INSERT INTO task_categories (user_id, name, color, sort_order)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [userId, title, color || null, nextOrder],
        );

        return NextResponse.json({ category: category.rows[0] }, { status: 201 });
    } catch (err) {
        console.error("POST /api/user/tasks/categories error:", err);
        return NextResponse.json({ error: "Failed to add task category." }, { status: 500 });
    }
});

export const PUT = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    try {
        const body = await req.json();
        const payload = body.payload;
        const { id, title, color } = payload;

        const catCheck = await pool.query(
            "SELECT 1 FROM task_categories WHERE id = $1 AND user_id = $2",
            [id, userId],
        );
        if (catCheck.rowCount === 0) {
            return NextResponse.json({ error: "Invalid task category" }, { status: 403 });
        }

        await pool.query(
            `UPDATE task_categories
            SET name = $1, color = $2
            WHERE id = $3`,
            [title, color || null, id],
        );

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        console.error("PUT /api/user/tasks/categories error:", err);
        return NextResponse.json({ error: "Failed to update task category." }, { status: 500 });
    }
});

export const DELETE = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    const client = await pool.connect();
    let began = false;

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        const catRes = await client.query(
            `SELECT sort_order
            FROM task_categories
            WHERE id = $1 AND user_id = $2`,
            [id, userId],
        );
        if (catRes.rowCount === 0) {
            return NextResponse.json({ error: "Invalid task category" }, { status: 403 });
        }

        const { sort_order } = catRes.rows[0];

        await client.query("BEGIN");
        began = true;

        await client.query("DELETE FROM tasks WHERE category_id = $1", [id]);
        await client.query("DELETE FROM task_tags WHERE category_id = $1", [id]);
        await client.query("DELETE FROM task_categories WHERE id = $1", [id]);

        await client.query(
            `UPDATE task_categories
            SET sort_order = sort_order - 1
            WHERE user_id = $1 AND sort_order > $2`,
            [userId, sort_order],
        );

        await client.query("COMMIT");
        began = false;

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        if (began) {
            await client.query("ROLLBACK");
        }
        console.error("DELETE /api/user/tasks/categories error:", err);
        return NextResponse.json({ error: "Failed to delete task category." }, { status: 500 });
    } finally {
        client.release();
    }
});
