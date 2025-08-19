import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";

export async function PATCH(req: Request) {
    const { accountId, password } = await req.json();

    const hashed = await bcrypt.hash(password, 12);

    await pool.query(
        "UPDATE users SET password=$1 WHERE id=$2",
        [hashed, accountId]
    );

    return NextResponse.json({ ok: true });
}
