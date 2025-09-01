import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function VerifyEmailPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const sp = await searchParams;
    const tokenParam = sp?.token;
    const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

    if (!token) {
        return UI("No verification token was provided.", false);
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold mb-2">Email Verification</h1>
            <form
                action={async () => {
                    "use server";
                    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token }),
                        cache: "no-store",
                    });
                }}
            >
                <p className="mb-4">Click the button below to verify your email.</p>
                <button
                    type="submit"
                    className="rounded-md px-4 py-2 bg-zinc-300 text-black hover:bg-zinc-400 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
                >
                    Verify Email
                </button>
            </form>
            <p className="mt-4">Or go back home:</p>
            <Link
                href="/"
                className="rounded-md px-4 py-2 bg-zinc-300 text-black hover:bg-zinc-400 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
            >
                Go to Home
            </Link>
        </main>
    );
}

function UI(message: string, success: boolean) {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold mb-2">Email Verification</h1>
            <p
                className={`mb-4 ${
                    success
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                }`}
            >
                {message}
            </p>
            <Link
                href="/"
                className="rounded-md px-4 py-2 bg-zinc-300 text-black hover:bg-zinc-400 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
            >
                Go to Home
            </Link>
        </main>
    );
}
