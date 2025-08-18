import crypto from "crypto";
import pool from "@/lib/db";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const client = await pool.connect();
    let began = false;
    try {
        const sp = await searchParams;
        const tokenParam = sp.token;
        const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
        if (!token) return UI("No verification token was provided.", false);

        const hashed = crypto.createHash("sha256").update(token).digest("hex");

        const res = await client.query(
            `SELECT user_id, expires_at FROM auth_tokens WHERE token=$1`,
            [hashed]
        );
        const row = res.rows[0];
        if (!row) {
            return UI("This verification link is invalid or has already been used.", false);
        }

        if (new Date(row.expires_at) < new Date()) {
            return UI("This verification link has expired. Please request a new one.", false);
        }

        await client.query("BEGIN");
        began = true;
        await client.query(`UPDATE users SET email_verified=true WHERE id=$1`, [row.user_id]);
        await client.query(`DELETE FROM auth_tokens WHERE token=$1`, [hashed]);
        await client.query("COMMIT");
        began = false;

        return UI("Your email has been verified successfully!", true);
    } catch (e) {
        if (began) { await client.query("ROLLBACK"); }
        console.error("Error verifying email:", e);
        return UI("An unexpected error occurred. Please try again later.", false);
    } finally {
        client.release();
    }
}

function UI(message: string, success: boolean) {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold mb-2">Email Verification:</h1>
            <p className={`mb-4 ${success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{message}</p>
            <p className="mb-4">You may now close this page, or click the link below:    </p>
            <Link
                href="/"
                className="rounded-md px-4 py-2 bg-zinc-300 text-black hover:bg-zinc-400 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
            >
                Go to Home
            </Link>
        </main>
    );
}
