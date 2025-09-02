"use client";

import { useState } from "react";
import Link from "next/link";

export default function ClientVerify({ token }: { token?: string }) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    if (!token) {
        return (
            <UI
                message="No verification token was provided."
                success={false}
            />
        );
    }

    const handleVerify = async () => {
        setStatus("loading");
        try {
            const res = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
                cache: "no-store",
            });
            const data = await res.json();
            if (res.ok) {
                setStatus("success");
                setMessage("Your email has been successfully verified!");
            } else {
                setStatus("error");
                setMessage(
                    data?.error === "invalid_or_expired"
                        ? "This verification link is invalid or has expired."
                        : "Something went wrong. Please try again."
                );
            }
        } catch {
            setStatus("error");
            setMessage("A server error occurred. Please try again later.");
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold mb-4">Email Verification</h1>

            {status === "idle" && (
                <>
                    <p className="mb-4">Click the button below to verify your email.</p>
                    <button
                        onClick={handleVerify}
                        className="rounded-md px-4 py-2 bg-zinc-300 text-black hover:bg-zinc-400 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
                    >
                        Verify Email
                    </button>
                </>
            )}

            {status === "loading" && <p className="mt-4">Verifying...</p>}

            {status === "success" && (
                <p className="mt-4 text-green-600 dark:text-green-400">
                    {message}
                </p>
            )}

            {status === "error" && (
                <p className="mt-4 text-red-600 dark:text-red-400">
                    {message || "Something went wrong. Please try again."}
                </p>
            )}

            <p className="mt-6">Or go back home:</p>
            <Link
                href="/"
                className="rounded-md px-4 py-2 bg-zinc-300 text-black hover:bg-zinc-400 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
            >
                Go to Home
            </Link>
        </main>
    );
}

function UI({ message, success }: { message: string; success: boolean }) {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold mb-2">Email Verification</h1>
            <p
                className={`mb-4 ${success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
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
