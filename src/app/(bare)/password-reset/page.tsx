import crypto from "crypto";
import pool from "@/lib/db";
import Link from "next/link";
import PasswordResetForm from "./PasswordResetForm";

export const dynamic = "force-dynamic";

export default async function PasswordResetPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    try {
        const sp = await searchParams;
        const tokenParam = sp.token;
        const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

        if (!token) {
            return UI("No reset token was provided.", false);
        }

        const hashed = crypto.createHash("sha256").update(token).digest("hex");

        const res = await pool.query(
            `SELECT user_id, expires_at FROM auth_tokens
            WHERE token=$1 AND purpose='password_reset'`,
            [hashed],
        );
        const row = res.rows[0];
        if (!row) {
            return UI("This reset link is invalid or has already been used.", false);
        }

        if (new Date(row.expires_at) < new Date()) {
            return UI("This reset link has expired. Please request a new one.", false);
        }

        return UI("Enter your new password below.", true, token);
    } catch (e) {
        console.error("Error loading password reset:", e);
        return UI("An unexpected error occurred. Please try again later.", false);
    }
}

function UI(message: string, success: boolean, token?: string) {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold mb-2">Reset Password:</h1>
            <p
                className={`mb-4 ${success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
                {message}
            </p>

            {success && token && <PasswordResetForm token={token} />}

            <p className="mb-4">You may now close this page, or click the link below: </p>
            <Link
                href="/"
                className="rounded-md px-4 py-2 bg-zinc-300 text-black hover:bg-zinc-400 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
            >
                Go to Home
            </Link>
        </main>
    );
}
