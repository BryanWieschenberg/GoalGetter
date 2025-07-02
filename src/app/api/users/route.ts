import pool from '@/lib/db';
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const res = await pool.query("SELECT * FROM users");
        return Response.json(res.rows);
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({error: "Error retrieving users "}), {status: 500});
    }
}

export async function POST(req: NextRequest) {
    try {
        const { username, email } = await req.json();
        if (!username || !email) {
            return new Response(JSON.stringify({error: "Missing fields"}), {status: 400});
        }
        const res = await pool.query(
            "INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *",
            [username, email]
        );
        return Response.json(res.rows[0]);
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({error: "Error creating user"}), {status: 500});
    }
}

export async function PUT(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    const { username, email } = await req.json();
    if (!id || !username || !email) {
        return new Response(JSON.stringify({error: "Missing fields"}), {status: 400});
    }
    const res = await pool.query(
        "UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *",
        [username, email, id]
    );
    return Response.json(res.rows[0]);
}

export async function DELETE(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get("id");
        await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING *",
            [id]
        )
        return Response.json({ success: true });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({error: "Error deleting user "}), {status: 500});
    }
}
