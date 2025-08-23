import { NextResponse } from "next/server";
import pool from "@/lib/db";
import authOptions from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";

export async function GET() {
    const session = await getServerSession(authOptions)
    try {
        const tasks = await pool.query(
            `SELECT t.*
            FROM tasks t
            JOIN task_categories tc ON t.category_id = tc.id
            WHERE tc.user_id = $1
            ORDER BY t.category_id, t.sort_order, t.id`,
            [session?.user.id]
        );

        return NextResponse.json({ tasks: tasks.rows }, { status: 200 });
    } catch (err) {
        console.error("GET /api/user/tasks/tasks:", err);
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const payload = body.payload;
        const { title, description, category_id, tag_id, due_date, priority } = payload;

        const { rows: maxRows } = await pool.query(
            `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order
            FROM tasks
            WHERE category_id = $1`,
            [category_id]
        );
        const nextOrder = maxRows[0].next_order;

        const result = await pool.query(
            `INSERT INTO tasks (title, description, category_id, tag_id, due_date, priority, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [title, description || null, category_id, tag_id || null, due_date || null, priority || "normal", nextOrder]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (err) {
        console.error("POST /api/user/tasks/tasks error:", err);
        return NextResponse.json({ error: "Failed to add task" }, { status: 500 });
    }
}
