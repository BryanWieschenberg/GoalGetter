import { auth } from "@/lib/authOptions";
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query("DELETE FROM users WHERE id=$1", [session.user.id]);

    if (result.rowCount === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
}
