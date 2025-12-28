import { NextResponse } from "next/server";
import { auth } from "@/lib/authOptions";
import pool from "@/lib/db";

export async function PATCH(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const client = await pool.connect();
    let began = false;

    try {
        const { category_id, direction } = await req.json();

        const { rows } = await client.query(
            `SELECT id, sort_order
             FROM task_categories
             WHERE id = $1 AND user_id = $2`,
            [category_id, session.user.id]
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
            [session.user.id, category.sort_order]
        );

        if (neighbor.rows.length === 0) {
            return NextResponse.json({ ok: true });
        }

        const swap = neighbor.rows[0];

        await client.query("BEGIN");
        began = true;

        await client.query(
            `UPDATE task_categories SET sort_order = $1 WHERE id = $2`,
            [swap.sort_order, category.id]
        );
        await client.query(
            `UPDATE task_categories SET sort_order = $1 WHERE id = $2`,
            [category.sort_order, swap.id]
        );

        await client.query("COMMIT");
        began = false;

        return NextResponse.json({ ok: true });
    } catch (err) {
        if (began) { await client.query("ROLLBACK"); }
        console.error("PATCH /api/user/tasks/categories/reorder", err);
        return NextResponse.json({ error: "Failed to reorder categories." }, { status: 500 });
    } finally {
        client.release();
    }
}
