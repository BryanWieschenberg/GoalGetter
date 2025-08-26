import { NextResponse } from "next/server";
import pool from "@/lib/db";
import authOptions from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {        
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

        const category = await pool.query(
            `INSERT INTO task_categories (user_id, name, color, sort_order)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [session?.user.id, title, color || null, nextOrder]
        );

        return NextResponse.json({ category: category.rows[0] }, { status: 201 });
    } catch (err) {
        console.error("POST /api/user/tasks/categories error:", err);
        return NextResponse.json({ error: "Failed to add category." }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const payload = body.payload;
        const { id, title, color } = payload;

        const catCheck = await pool.query(
            "SELECT 1 FROM task_categories WHERE id = $1 AND user_id = $2",
            [id, session.user.id]
        );
        if (catCheck.rowCount === 0) {
            return NextResponse.json({ error: "Invalid category" }, { status: 403 });
        }

        await pool.query(
            `UPDATE task_categories
            SET name = $1, color = $2
            WHERE id = $3`,
            [title, color || null, id]
        );

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        console.error("PUT /api/user/tasks/categories error:", err);
        return NextResponse.json({ error: "Failed to update category." }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const client = await pool.connect();
    let began = false;

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        const catRes = await client.query(
            `SELECT sort_order
            FROM task_categories
            WHERE id = $1 AND user_id = $2`,
            [id, session.user.id]
        );
        if (catRes.rowCount === 0) {
            return NextResponse.json({ error: "Invalid category" }, { status: 403 });
        }

        const { sort_order } = catRes.rows[0];

        await client.query("BEGIN");
        began = true;

        await client.query("DELETE FROM tasks WHERE category_id = $1", [id]);
        await client.query("DELETE FROM task_tags WHERE category_id = $1", [id]);
        await client.query("DELETE FROM task_categories WHERE id = $1", [id]);

        await client.query(
            `UPDATE task_categories
            SET sort_order = sort_order - 1
            WHERE user_id = $1 AND sort_order > $2`,
            [session.user.id, sort_order]
        );

        await client.query("COMMIT");
        began = false;

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        if (began) { await client.query("ROLLBACK"); }
        console.error("DELETE /api/user/tasks/categories error:", err);
        return NextResponse.json({ error: "Failed to delete category." }, { status: 500 });
    } finally {
        client.release();
    }
}
