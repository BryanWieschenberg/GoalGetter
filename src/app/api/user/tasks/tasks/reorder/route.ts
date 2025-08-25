import { NextResponse } from "next/server";
import pool from "@/lib/db";
import authOptions from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const client = await pool.connect();
    let began = false;

    try {
        const { task_id, to_category_id, to_index } = await req.json();
        if (typeof task_id !== "number" || typeof to_category_id !== "number" || typeof to_index !== "number" || to_index < 0) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const { rows: taskRows } = await client.query(
            `SELECT t.id, t.category_id, t.sort_order
             FROM tasks t
             JOIN task_categories tc ON t.category_id = tc.id
             WHERE t.id = $1 AND tc.user_id = $2`,
            [task_id, session.user.id]
        );
        if (taskRows.length === 0) {
            return NextResponse.json({ error: "Task not found or not owned by user" }, { status: 403 });
        }
        const { category_id: from_category_id, sort_order: from_index } = taskRows[0];

        const { rowCount: catCheck } = await client.query(
            `SELECT 1 FROM task_categories WHERE id = $1 AND user_id = $2`,
            [to_category_id, session.user.id]
        );
        if (catCheck === 0) {
            return NextResponse.json({ error: "Invalid target category" }, { status: 403 });
        }

        await client.query("BEGIN");
        began = true;

        if (from_category_id === to_category_id) { // Reorder within same category
            if (to_index === from_index) {
                await client.query("COMMIT");
                began = false;
                return NextResponse.json({ ok: true }, { status: 200 });
            }

            if (to_index > from_index) { // Shift left: items between (from_index+1..to_index) move up by -1
                await client.query(
                    `UPDATE tasks
                     SET sort_order = sort_order - 1
                     WHERE category_id = $1 AND sort_order > $2 AND sort_order <= $3`,
                    [from_category_id, from_index, to_index]
                );
            } else { // Shift right: items between (to_index..from_index-1) move down by +1
                await client.query(
                    `UPDATE tasks
                     SET sort_order = sort_order + 1
                     WHERE category_id = $1 AND sort_order >= $2 AND sort_order < $3`,
                    [from_category_id, to_index, from_index]
                );
            }

            await client.query(
                `UPDATE tasks
                 SET sort_order = $1
                 WHERE id = $2`,
                [to_index, task_id]
            );
        } else { // Moving across categories
            await client.query(
                `UPDATE tasks
                 SET sort_order = sort_order - 1
                 WHERE category_id = $1 AND sort_order > $2`,
                [from_category_id, from_index]
            );

            await client.query(
                `UPDATE tasks
                 SET sort_order = sort_order + 1
                 WHERE category_id = $1 AND sort_order >= $2`,
                [to_category_id, to_index]
            );

            await client.query(
                `UPDATE tasks
                 SET category_id = $1, sort_order = $2
                 WHERE id = $3`,
                [to_category_id, to_index, task_id]
            );
        }

        await client.query("COMMIT");
        began = false;

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (e) {
        if (began) { await client.query("ROLLBACK"); }
        console.error("POST /api/user/tasks/tasks/reorder error:", e);
        return NextResponse.json({ error: "Failed to reorder task." }, { status: 500 });
    } finally {
        client.release();
    }
}
