import { NextResponse } from "next/server";
import pool from "@/lib/db";
import authOptions from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";

export async function GET() {
    const session = await getServerSession(authOptions)
    try {
        const [categories, tags, tasks] = await Promise.all([
            pool.query("SELECT * FROM task_categories WHERE user_id=$1", [session?.user.id]),
            pool.query(
                `SELECT tt.*
                FROM task_tags tt
                JOIN task_categories tc ON tt.category_id = tc.id
                WHERE tc.user_id=$1
                ORDER BY tt.id`,
                [session?.user.id]
            ),
            pool.query(
                `SELECT t.*
                FROM tasks t
                JOIN task_categories tc ON t.category_id = tc.id
                WHERE tc.user_id=$1
                ORDER BY t.id`,
                [session?.user.id]
            )
        ]);

        return NextResponse.json({
            task_categories: categories.rows,
            task_tags: tags.rows,
            tasks: tasks.rows,
        });
    } catch (err) {
        console.error("GET /api/data error:", err);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, payload } = body; // type: "task" | "tag" | "category", payload: fields for that row
        console.log(type, payload)
        let result;

        if (type === "task") {
            const { title, description, category_id, tag_id, due_date, priority } = payload;
            result = await pool.query(
                `INSERT INTO tasks (title, description, category_id, tag_id, due_date, priority)
                 VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
                [title, description || null, category_id, tag_id || null, due_date || null, priority || "normal"]
            );
        }

        if (type === "category") {
            const { name, color } = payload;
            result = await pool.query(
                `INSERT INTO task_categories (name, color)
                 VALUES ($1,$2) RETURNING *`,
                [name, color || null]
            );
        }

        if (type === "tag") {
            const { name, color } = payload;
            result = await pool.query(
                `INSERT INTO task_tags (name, color)
                 VALUES ($1,$2) RETURNING *`,
                [name, color || null]
            );
        }

        return NextResponse.json(result ? result.rows[0] : null, { status: 201 });
    } catch (err) {
        console.error("POST /api/data error:", err);
        return NextResponse.json({ error: "Failed to insert" }, { status: 500 });
    }
}
