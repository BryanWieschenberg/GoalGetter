import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { apiRateLimit } from "@/lib/rateLimit";
import { withAuth } from "@/lib/authMiddleware";
import { validate, validationError, DIRECTIONS } from "@/lib/validate";

export const PATCH = withAuth(async (req, userId) => {
    const limited = await apiRateLimit(req);
    if (limited) return limited;

    const client = await pool.connect();
    let began = false;

    try {
        const { category_id, direction } = await req.json();

        const err = validate([
            { field: "category_id", value: category_id, required: true, type: "number" },
            {
                field: "direction",
                value: direction,
                required: true,
                type: "string",
                enum: DIRECTIONS,
            },
        ]);
        if (err) return validationError(err);

        const { rows } = await client.query(
            `SELECT id, sort_order
             FROM task_categories
             WHERE id = $1 AND user_id = $2`,
            [category_id, userId],
        );
        if (rows.length === 0) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        const category = rows[0];
        const directionOp = direction === "up" ? "<" : ">";
        const orderDir = direction === "up" ? "DESC" : "ASC";

        const neighbor = await client.query(
            `SELECT id, sort_order
            FROM task_categories
            WHERE user_id = $1
            AND sort_order ${directionOp} $2
            ORDER BY sort_order ${orderDir}
            LIMIT 1`,
            [userId, category.sort_order],
        );

        if (neighbor.rows.length === 0) {
            return NextResponse.json({ ok: true });
        }

        const swap = neighbor.rows[0];

        await client.query("BEGIN");
        began = true;

        await client.query(`UPDATE task_categories SET sort_order = $1 WHERE id = $2`, [
            swap.sort_order,
            category.id,
        ]);
        await client.query(`UPDATE task_categories SET sort_order = $1 WHERE id = $2`, [
            category.sort_order,
            swap.id,
        ]);

        await client.query("COMMIT");
        began = false;

        return NextResponse.json({ ok: true });
    } catch (err) {
        if (began) {
            await client.query("ROLLBACK");
        }
        console.error("PATCH /api/user/tasks/categories/reorder", err);
        return NextResponse.json({ error: "Failed to reorder categories." }, { status: 500 });
    } finally {
        client.release();
    }
});
