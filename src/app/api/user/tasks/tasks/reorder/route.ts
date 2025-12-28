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
        const { task_id, direction } = await req.json();

        const ownerCheck = await client.query(
            `SELECT 1
            FROM tasks t
            JOIN task_categories tc ON t.category_id = tc.id
            WHERE t.id = $1 AND tc.user_id = $2`,
            [task_id, session?.user.id]
        );
        if (ownerCheck.rowCount === 0) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { rows } = await client.query(
            `SELECT id, category_id, sort_order
            FROM tasks
            WHERE id = $1`,
            [task_id]
        );
        if (rows.length === 0) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        const task = rows[0];

        const directionOp = direction === "up" ? "<" : ">";
        const orderDir = direction === "up" ? "DESC" : "ASC";

        const neighbor = await client.query(
            `SELECT id, sort_order
            FROM tasks
            WHERE category_id = $1
            AND sort_order ${directionOp} $2
            ORDER BY sort_order ${orderDir}
            LIMIT 1`,
            [task.category_id, task.sort_order]
        );

        if (neighbor.rows.length === 0) {
            return NextResponse.json({ ok: true });
        }

        const swap = neighbor.rows[0];

        await client.query("BEGIN");
        began = true;

        await client.query(
            `UPDATE tasks SET sort_order = $1 WHERE id = $2`,
            [swap.sort_order, task.id]
        );
        await client.query(
            `UPDATE tasks SET sort_order = $1 WHERE id = $2`,
            [task.sort_order, swap.id]
        );
        await client.query("COMMIT");
        began = false;

        return NextResponse.json({ ok: true });
    } catch (err) {
        if (began) { await client.query("ROLLBACK"); }
        console.error("PATCH /api/user/tasks/tasks/reorder", err);
        return NextResponse.json({ error: "Failed to reorder tasks." }, { status: 500 });
    } finally {
        client.release();
    }
}
