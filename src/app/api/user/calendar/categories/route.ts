import { NextResponse } from "next/server";
import pool from "@/lib/db";
import authOptions from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const categories = await pool.query(
            `SELECT *
            FROM event_categories
            WHERE user_id = $1
            ORDER BY id ASC`,
            [session?.user.id]
        );

        return NextResponse.json({ categories: categories.rows }, { status: 200 });
    } catch (e) {
        console.error("GET /api/user/calendar/categories:", e);
        return NextResponse.json({ error: "Failed to fetch calendar categories." }, { status: 500 });
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
        console.log(payload)
        const { name, color } = payload;

        await pool.query(
            `INSERT INTO event_categories (user_id, name, color)
             VALUES ($1, $2, $3)
             RETURNING id, name, color`,
            [session.user.id, name, color || null]
        );

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (e) {
        console.error("POST /api/user/calendar/categories error:", e);
        return NextResponse.json({ error: "Failed to add calendar category." }, { status: 500 });
    }
}
