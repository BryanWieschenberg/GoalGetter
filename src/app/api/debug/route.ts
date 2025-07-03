import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        PGUSER: process.env.PGUSER,
        PGHOST: process.env.PGHOST,
        PGPORT: process.env.PGPORT,
        PGNAME: process.env.PGNAME,
        PGPASSWORD: !!process.env.PGPASSWORD, // just true/false
    });
}
