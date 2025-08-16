import pool from "@/lib/db";
import crypto from "crypto";

export async function generateHandle(baseName: string) {
    const base = (baseName && baseName.trim() !== "" ? baseName : "user")
        .replace(/\s+/g, "")
        .toLowerCase();

    let handle: string;

    while (true) {
        const randomSuffix = crypto.randomBytes(3).toString("hex");
        handle = `${base}-${randomSuffix}`;

        const result = await pool.query(
            `INSERT INTO users (handle)
             VALUES ($1)
             ON CONFLICT (handle) DO NOTHING
             RETURNING handle`,
            [handle]
        );

        if (result.rows.length > 0) {
            return result.rows[0].handle;
        }
    }
}
