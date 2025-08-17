import crypto from "crypto";
import pool from "@/lib/db";
import Link from "next/link";

export default async function VerifyEmailPage({ searchParams }: { searchParams: { token: string } }) {
    const token = searchParams.token;
    if (!token) return UI("No verification token was provided.", false);

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const res = await pool.query(
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

    await pool.query(`UPDATE users SET email_verified=true WHERE id=$1`, [row.user_id]);
    await pool.query(`DELETE FROM auth_tokens WHERE token=$1`, [hashed]);

    return UI("Your email has been verified successfully!", true);
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
