import { NextResponse } from "next/server";
import pool from "@/lib/db";
import authOptions from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";

export async function GET() {
    const session = await getServerSession(authOptions)
    try {
        const categories = await pool.query(
            `SELECT *
            FROM task_categories
            WHERE user_id = $1
            ORDER BY sort_order, id`,
            [session?.user.id]
        );

        return NextResponse.json({ categories: categories.rows }, { status: 200 });
    } catch (err) {
        console.error("GET /api/user/tasks/categories error:", err);
        return NextResponse.json({ error: "Failed to fetch categories." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        
        const body = await req.json();
        const payload = body.payload;
        const { title, color } = payload;

        const { rows: maxRows } = await pool.query(
            `SELECT COALESCE(MAX(sort_order) + 1, 0) AS next_order
            FROM task_categories
            WHERE user_id = $1`,
            [session?.user.id]
        );
        const nextOrder = maxRows[0].next_order;

        const result = await pool.query(
            `INSERT INTO task_categories (user_id, name, color, sort_order)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [session?.user.id, title, color || null, nextOrder]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (err) {
        console.error("POST /api/user/tasks/categories error:", err);
        return NextResponse.json({ error: "Failed to add category." }, { status: 500 });
    }
}
