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
        const events = await pool.query(
            `SELECT
                e.id, e.title, e.description, e.category_id, e.color, e.start_time, e.end_time,
                r.frequency, r.interval, r.weekly, r.count, r.exceptions, r.until
            FROM events e
            LEFT JOIN event_recurrence r ON e.id = r.event_id
            WHERE e.category_id IN (SELECT id FROM event_categories WHERE user_id = $1)
            ORDER BY e.start_time ASC`,
            [session.user.id]
        );

        return NextResponse.json({ events: events.rows }, { status: 200 });
    } catch (e) {
        console.error("GET /api/user/calendar/events:", e);
        return NextResponse.json({ error: "Failed to fetch events." }, { status: 500 });
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
        const {
            title, description, category_id, color, start_time, end_time,
            frequency, interval, count, until, weekly, exceptions
         } = payload;

        const catCheck = await pool.query(
            "SELECT 1 FROM event_categories WHERE id = $1 AND user_id = $2",
            [category_id, session?.user.id]
        );
        if (catCheck.rowCount === 0) {
            return NextResponse.json({ error: "Invalid category" }, { status: 403 });
        }

        const eventRes = await pool.query(
            `INSERT INTO events (title, description, category_id, color, start_time, end_time)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id`,
            [title, description || null, category_id, color || null, start_time, end_time]
        );

        const eventId = eventRes.rows[0].id;

        if (frequency) {
            await pool.query(
                `INSERT INTO event_recurrence (event_id, frequency, interval, weekly, count, exceptions, until)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    eventId,
                    frequency,
                    interval ? Number(interval) : null,
                    weekly && weekly.length > 0 ? weekly : null,
                    count ? Number(count) : null,
                    exceptions ? exceptions.split(",").map((x: string) => x.trim()) : null,
                    until || null
                ]
            );
        }

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (e) {
        console.error("POST /api/user/calendar/events error:", e);
        return NextResponse.json({ error: "Failed to add event." }, { status: 500 });
    }
}
