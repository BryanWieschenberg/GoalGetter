import { NextResponse } from "next/server";
import pool from "@/lib/db";
import authOptions from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";

export async function GET() {
    const session = await getServerSession(authOptions)
    try {
        const tags = await pool.query(
            `SELECT tg.*
            FROM task_tags tg
            JOIN task_categories tc ON tg.category_id = tc.id
            WHERE tc.user_id = $1
            ORDER BY tg.category_id, tg.id`,
            [session?.user.id]
        );

        return NextResponse.json({ tags: tags.rows }, { status: 200 });
    } catch (err) {
        console.error("GET /api/user/tasks/tags:", err);
        return NextResponse.json({ error: "Failed to fetch tags." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const payload = body.payload;
        const { title, category_id, color } = payload;

        const result = await pool.query(
            `INSERT INTO task_tags (name, category_id, color)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [title, category_id, color || null]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (err) {
        console.error("POST /api/user/tasks/tags error:", err);
        return NextResponse.json({ error: "Failed to add tag." }, { status: 500 });
    }
}
