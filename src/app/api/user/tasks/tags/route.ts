import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { apiRateLimit } from "@/lib/rateLimit";
import { withAuth } from "@/lib/authMiddleware";
import { validate, validationError, sanitize, MAX_TITLE, MAX_COLOR } from "@/lib/validate";

export const GET = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    try {
        const tags = await pool.query(
            `SELECT tg.*
            FROM task_tags tg
            JOIN task_categories tc ON tg.category_id = tc.id
            WHERE tc.user_id = $1
            ORDER BY tg.category_id, tg.id`,
            [userId],
        );

        return NextResponse.json({ tags: tags.rows }, { status: 200 });
    } catch (err) {
        console.error("GET /api/user/tasks/tags:", err);
        return NextResponse.json({ error: "Failed to fetch tags." }, { status: 500 });
    }
});

export const POST = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    try {
        const body = await req.json();
        const payload = body.payload;
        const title = sanitize(payload.title);
        const color = sanitize(payload.color);
        const { category_id } = payload;

        const err = validate([
            {
                field: "title",
                value: title,
                required: true,
                type: "string",
                maxLength: MAX_TITLE,
                minLength: 1,
            },
            { field: "category_id", value: category_id, required: true, type: "number" },
            {
                field: "color",
                value: color,
                type: "string",
                maxLength: MAX_COLOR,
                pattern: /^[0-9a-fA-F]{0,6}$/,
                patternMessage: "color must be a hex value",
            },
        ]);
        if (err) return validationError(err);

        const catCheck = await pool.query(
            "SELECT 1 FROM task_categories WHERE id = $1 AND user_id = $2",
            [category_id, userId],
        );
        if (catCheck.rowCount === 0) {
            return NextResponse.json({ error: "Invalid category" }, { status: 403 });
        }

        await pool.query(
            `INSERT INTO task_tags (name, category_id, color)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [title, category_id, color || null],
        );

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (err) {
        console.error("POST /api/user/tasks/tags error:", err);
        return NextResponse.json({ error: "Failed to add tag." }, { status: 500 });
    }
});

export const PUT = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    try {
        const body = await req.json();
        const payload = body.payload;
        const title = sanitize(payload.title);
        const color = sanitize(payload.color);
        const { id, category_id } = payload;

        const err = validate([
            { field: "id", value: id, required: true, type: "number" },
            {
                field: "title",
                value: title,
                required: true,
                type: "string",
                maxLength: MAX_TITLE,
                minLength: 1,
            },
            { field: "category_id", value: category_id, required: true, type: "number" },
            {
                field: "color",
                value: color,
                type: "string",
                maxLength: MAX_COLOR,
                pattern: /^[0-9a-fA-F]{0,6}$/,
                patternMessage: "color must be a hex value",
            },
        ]);
        if (err) return validationError(err);

        const tagCheck = await pool.query(
            `SELECT tg.id
             FROM task_tags tg
             JOIN task_categories tc ON tg.category_id = tc.id
             WHERE tg.id = $1 AND tc.user_id = $2`,
            [id, userId],
        );
        if (tagCheck.rowCount === 0) {
            return NextResponse.json({ error: "Invalid tag" }, { status: 403 });
        }

        await pool.query(
            `UPDATE task_tags
            SET name = $1, category_id = $2, color = $3
            WHERE id = $4`,
            [title, category_id, color || null, id],
        );

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        console.error("PUT /api/user/tasks/tags error:", err);
        return NextResponse.json({ error: "Failed to update tag." }, { status: 500 });
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

        const tagCheck = await client.query(
            `SELECT tg.id
             FROM task_tags tg
             JOIN task_categories tc ON tg.category_id = tc.id
             WHERE tg.id = $1 AND tc.user_id = $2`,
            [id, userId],
        );
        if (tagCheck.rowCount === 0) {
            return NextResponse.json({ error: "Invalid tag" }, { status: 403 });
        }

        await client.query("BEGIN");
        began = true;

        await client.query("UPDATE tasks SET tag_id = NULL WHERE tag_id = $1", [id]);
        await client.query("DELETE FROM task_tags WHERE id = $1", [id]);

        await client.query("COMMIT");
        began = false;

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        if (began) {
            await client.query("ROLLBACK");
        }
        console.error("DELETE /api/user/tasks/tags error:", err);
        return NextResponse.json({ error: "Failed to delete tag." }, { status: 500 });
    } finally {
        client.release();
    }
});
