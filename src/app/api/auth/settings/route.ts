import { NextResponse } from "next/server";
import { auth } from "@/lib/authOptions";
import pool from "@/lib/db";

interface UserSettings {
    theme: string;
    week_start: string;
}

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query<UserSettings>(
        "SELECT theme, week_start FROM user_settings WHERE user_id=$1",
        [session.user.id],
    );

    if (result.rowCount === 0) {
        return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
}

export async function PUT(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: UserSettings = await req.json();

    await pool.query(`UPDATE user_settings SET theme=$1, week_start=$2 WHERE user_id=$3`, [
        body.theme,
        body.week_start,
        session.user.id,
    ]);

    return NextResponse.json({ ok: true });
}
