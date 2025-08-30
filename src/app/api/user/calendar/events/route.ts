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
    const client = await pool.connect();
    let began = false;

    try {
        const body = await req.json();
        const payload = body.payload;
        const {
            title, description, category_id, color, start_time, end_time,
            frequency, interval, count, until, weekly, exceptions
         } = payload;

        const catCheck = await client.query(
            "SELECT 1 FROM event_categories WHERE id = $1 AND user_id = $2",
            [category_id, session?.user.id]
        );
        if (catCheck.rowCount === 0) {
            return NextResponse.json({ error: "Invalid category" }, { status: 403 });
        }

        await client.query("BEGIN");
        began = true;

        const eventRes = await client.query(
            `INSERT INTO events (title, description, category_id, color, start_time, end_time)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id`,
            [title, description || null, category_id, color || null, start_time, end_time]
        );

        const eventId = eventRes.rows[0].id;

        if (frequency) {
            await client.query(
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
        await client.query("COMMIT");
        began = false;

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (e) {
        if (began) { await client.query("ROLLBACK"); }
        console.error("POST /api/user/calendar/events error:", e);
        return NextResponse.json({ error: "Failed to add event." }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const client = await pool.connect();
    let began = false;

    try {
        const body = await req.json();
        const payload = body.payload;
        const {
            id, title, description, category_id, color, start_time, end_time,
            frequency, interval, count, until, weekly, exceptions
        } = payload;

        const catCheck = await client.query(
            "SELECT 1 FROM event_categories WHERE id = $1 AND user_id = $2",
            [category_id, session.user.id]
        );
        if (catCheck.rowCount === 0) {
            return NextResponse.json({ error: "Invalid category" }, { status: 403 });
        }

        await client.query("BEGIN");
        began = true;

        await client.query(
            `UPDATE events
             SET title=$1, description=$2, category_id=$3, color=$4, start_time=$5, end_time=$6
             WHERE id=$7`,
            [title, description || null, category_id, color || null, start_time, end_time, id]
        );

        await client.query(`DELETE FROM event_recurrence WHERE event_id=$1`, [id]);

        if (frequency) {
            await client.query(
                `INSERT INTO event_recurrence (event_id, frequency, interval, weekly, count, exceptions, until)
                 VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                [
                    id,
                    frequency,
                    interval ? Number(interval) : null,
                    weekly && weekly.length > 0 ? weekly : null,
                    count ? Number(count) : null,
                    exceptions ? exceptions.split(",").map((x: string) => x.trim()) : null,
                    until || null
                ]
            );
        }

        await client.query("COMMIT");
        began = false;

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (e) {
        if (began) { await client.query("ROLLBACK"); }
        console.error("PUT /api/user/calendar/events error:", e);
        return NextResponse.json({ error: "Failed to update event." }, { status: 500 });
    } finally {
        client.release();
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

        const evCheck = await client.query(
            `SELECT 1
             FROM events e
             JOIN event_categories ec ON e.category_id = ec.id
             WHERE e.id=$1 AND ec.user_id=$2`,
            [id, session.user.id]
        );
        if (evCheck.rowCount === 0) {
            return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
        }

        await client.query("BEGIN");
        began = true;

        await client.query(`DELETE FROM event_recurrence WHERE event_id=$1`, [id]);
        await client.query(`DELETE FROM events WHERE id=$1`, [id]);

        await client.query("COMMIT");
        began = false;

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (e) {
        if (began) { await client.query("ROLLBACK"); }
        console.error("DELETE /api/user/calendar/events error:", e);
        return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
    } finally {
        client.release();
    }
}
