'use client';

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function VerifyAccount() {
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

    const resend = async () => {
        try {
            setStatus("sending");
            const res = await fetch("/api/auth/resend-verification", { method: "POST" });
            setStatus(res.ok ? "sent" : "error");
        } catch {
            setStatus("error");
        }
    };

    return (
        <div
            role="alert"
            aria-live="polite"
            className="w-full border-y py-[.2rem] bg-amber-100 border-amber-300 text-amber-900 dark:border-purple-600 dark:bg-purple-950 dark:text-purple-100"
        >
            <div className="mx-auto flex items-center justify-center ">
                <p className="text-sm sm:text-base">
                    <span className="font-semibold">Verify your email:</span> You haven't confirmed your account yet.
                </p>
                <button
                    type="button"
                    onClick={resend}
                    disabled={status === "sending"}
                    aria-busy={status === "sending"}
                    className="shrink-0 rounded-md border ml-2 px-2 py-0.5 text-sm font-medium disabled:opacity-60 hover:cursor-pointer border-amber-300 bg-amber-200 hover:bg-amber-300 dark:border-purple-600 dark:bg-purple-800 dark:hover:bg-purple-600"
                >
                    {status === "sending" ? "Sending..." : status === "sent" ? "Sent" : "Resend Verification Email"}
                </button>
            </div>
        </div>
    );
}
