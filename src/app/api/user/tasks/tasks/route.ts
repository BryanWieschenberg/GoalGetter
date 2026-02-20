import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { apiRateLimit } from "@/lib/rateLimit";
import { withAuth } from "@/lib/authMiddleware";
import {
    validate,
    validationError,
    sanitize,
    MAX_TITLE,
    MAX_DESCRIPTION,
    PRIORITIES,
} from "@/lib/validate";

export const GET = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
        const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

        const tasks = await pool.query(
            `SELECT t.id, t.title, t.description, t.category_id, t.tag_id, t.priority, t.sort_order, t.due_date::date::text AS due_date
            FROM tasks t
            JOIN task_categories tc ON t.category_id = tc.id
            WHERE tc.user_id = $1
            ORDER BY t.category_id, t.sort_order, t.id
            LIMIT $2 OFFSET $3`,
            [userId, limit + 1, offset],
        );

        const hasMore = tasks.rows.length > limit;
        const rows = hasMore ? tasks.rows.slice(0, limit) : tasks.rows;

        return NextResponse.json({ tasks: rows, hasMore }, { status: 200 });
    } catch (e) {
        console.error("GET /api/user/tasks/tasks:", e);
        return NextResponse.json({ error: "Failed to fetch tasks." }, { status: 500 });
    }
});

export const POST = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    try {
        const body = await req.json();
        const payload = body.payload;
        const title = sanitize(payload.title);
        const description = sanitize(payload.description);
        const { category_id, tag_id, due_date, priority } = payload;

        const err = validate([
            {
                field: "title",
                value: title,
                required: true,
                type: "string",
                maxLength: MAX_TITLE,
                minLength: 1,
            },
            {
                field: "description",
                value: description,
                type: "string",
                maxLength: MAX_DESCRIPTION,
            },
            { field: "category_id", value: category_id, required: true, type: "number" },
            { field: "tag_id", value: tag_id, type: "number" },
            {
                field: "due_date",
                value: due_date,
                type: "string",
                pattern: /^\d{4}-\d{2}-\d{2}$/,
                patternMessage: "due_date must be YYYY-MM-DD",
            },
            { field: "priority", value: priority, type: "string", enum: PRIORITIES },
        ]);
        if (err) return validationError(err);

        const catCheck = await pool.query(
            "SELECT 1 FROM task_categories WHERE id = $1 AND user_id = $2",
            [category_id, userId],
        );
        if (catCheck.rowCount === 0) {
            return NextResponse.json({ error: "Invalid category" }, { status: 403 });
        }

        const { rows: maxRows } = await pool.query(
            `SELECT COALESCE(MAX(sort_order) + 1, 0) AS next_order
            FROM tasks
            WHERE category_id = $1`,
            [category_id],
        );
        const nextOrder = maxRows[0].next_order;

        await pool.query(
            `INSERT INTO tasks (title, description, category_id, tag_id, due_date, priority, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                title,
                description || null,
                category_id,
                tag_id || null,
                due_date || null,
                priority || "normal",
                nextOrder,
            ],
        );

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (e) {
        console.error("POST /api/user/tasks/tasks error:", e);
        return NextResponse.json({ error: "Failed to add task." }, { status: 500 });
    }
});

export const PUT = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    const client = await pool.connect();
    let began = false;

    try {
        const body = await req.json();
        const payload = body.payload;
        const title = sanitize(payload.title);
        const description = sanitize(payload.description);
        const { id, category_id, tag_id, due_date, priority } = payload;

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
            {
                field: "description",
                value: description,
                type: "string",
                maxLength: MAX_DESCRIPTION,
            },
            { field: "category_id", value: category_id, required: true, type: "number" },
            { field: "tag_id", value: tag_id, type: "number" },
            {
                field: "due_date",
                value: due_date,
                type: "string",
                pattern: /^\d{4}-\d{2}-\d{2}$/,
                patternMessage: "due_date must be YYYY-MM-DD",
            },
            { field: "priority", value: priority, type: "string", enum: PRIORITIES },
        ]);
        if (err) return validationError(err);

        await client.query("BEGIN");
        began = true;

        const oldCatRes = await client.query(
            `SELECT t.category_id, t.sort_order
            FROM tasks t
            JOIN task_categories tc ON t.category_id = tc.id
            WHERE t.id = $1 AND tc.user_id = $2`,
            [id, userId],
        );
        if (oldCatRes.rowCount === 0) {
            return NextResponse.json({ error: "Invalid task" }, { status: 403 });
        }

        const { category_id: oldCatId, sort_order: oldSort } = oldCatRes.rows[0];

        if (oldCatId !== category_id) {
            await client.query(
                `UPDATE tasks
                SET sort_order = sort_order - 1
                WHERE category_id = $1 AND sort_order > $2`,
                [oldCatId, oldSort],
            );

            const maxSortRes = await client.query(
                "SELECT COALESCE(MAX(sort_order) + 1, 0) AS next_order FROM tasks WHERE category_id = $1",
                [category_id],
            );
            const nextSortOrder = maxSortRes.rows[0].next_order;

            await client.query(
                `UPDATE tasks
                SET title = $1, description = $2, category_id = $3, tag_id = $4, due_date = $5, priority = $6, sort_order = $7
                WHERE id = $8`,
                [
                    title,
                    description || null,
                    category_id,
                    tag_id || null,
                    due_date || null,
                    priority || "normal",
                    nextSortOrder,
                    id,
                ],
            );
        } else {
            await client.query(
                `UPDATE tasks
                SET title = $1, description = $2, category_id = $3, tag_id = $4, due_date = $5, priority = $6
                WHERE id = $7`,
                [
                    title,
                    description || null,
                    category_id,
                    tag_id || null,
                    due_date || null,
                    priority || "normal",
                    id,
                ],
            );
        }

        await client.query("COMMIT");
        began = false;

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (e) {
        if (began) {
            await client.query("ROLLBACK");
        }
        console.error("PUT /api/user/tasks/tasks error:", e);
        return NextResponse.json({ error: "Failed to update task." }, { status: 500 });
    } finally {
        client.release();
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

        const taskRes = await client.query(
            `SELECT t.category_id, t.sort_order
            FROM tasks t
            JOIN task_categories tc ON t.category_id = tc.id
            WHERE t.id = $1 AND tc.user_id = $2`,
            [id, userId],
        );
        if (taskRes.rowCount === 0) {
            return NextResponse.json({ error: "Invalid task" }, { status: 403 });
        }

        const { category_id, sort_order } = taskRes.rows[0];

        await client.query("BEGIN");
        began = true;

        await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
        await pool.query(
            `UPDATE tasks
            SET sort_order = sort_order - 1
            WHERE category_id = $1 AND sort_order > $2`,
            [category_id, sort_order],
        );
        await client.query("COMMIT");
        began = false;

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (e) {
        if (began) {
            await client.query("ROLLBACK");
        }
        console.error("DELETE /api/user/tasks/tasks error:", e);
        return NextResponse.json({ error: "Failed to delete task." }, { status: 500 });
    } finally {
        client.release();
    }
});
