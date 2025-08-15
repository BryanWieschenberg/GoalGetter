import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import pool from "@/lib/db";
import authOptions from "@/lib/authOptions";

interface UserSettings {
    theme: string;
    timezone: string;
    notifications_enabled: boolean;
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query<UserSettings>(
        "SELECT theme, timezone, notifications_enabled FROM user_settings WHERE user_id=$1",
        [session.user.id]
    );

    if (result.rowCount === 0) {
        return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: UserSettings = await req.json();

    await pool.query(
        `UPDATE user_settings
         SET theme=$1, timezone=$2, notifications_enabled=$3
         WHERE user_id=$4`,
        [body.theme, body.timezone, body.notifications_enabled, session.user.id]
    );

    return NextResponse.json({ ok: true });
}
