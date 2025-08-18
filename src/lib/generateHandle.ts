import crypto from "crypto";
import { PoolClient } from "pg";

export async function generateHandle(baseName: string, client: PoolClient) {
    const base = (baseName && baseName.trim() !== "" ? baseName : "user")
        .replace(/\s+/g, "")
        .toLowerCase();

    let handle: string;

    while (true) {
        const randomSuffix = crypto.randomBytes(3).toString("hex");
        handle = `${base}-${randomSuffix}`;

        const result = await client.query(
            `SELECT 1 FROM users WHERE handle = $1`,
            [handle]
        );

        if (result.rowCount === 0) {
            return handle;
        }
    }
}
