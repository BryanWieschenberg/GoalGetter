"use client";

import { useEffect, useState } from "react";

export default function VerifyAccount() {
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [cooldown, setCooldown] = useState<number>(0);

    const resend = async () => {
        try {
            setStatus("sending");
            const res = await fetch("/api/auth/signup-resend", { method: "POST" });
            const data = await res.json();

            if (!res.ok) {
                if (data.error === "cooldown" && typeof data.remaining === "number") {
                    setCooldown(Number(data?.remaining ?? 60));
                    setStatus("idle");
                    return;
                }
                setStatus("error");
                return;
            }
            setCooldown(60);
            setStatus("idle");
        } catch {
            setStatus("error");
        }
    };

    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }

        const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(id);
    }, [cooldown]);

    return (
        <div
            role="alert"
            aria-live="polite"
            className="w-full border-y py-[.2rem] bg-amber-100 border-amber-300 text-amber-900 dark:border-purple-600 dark:bg-purple-950 dark:text-purple-100"
        >
            <div className="mx-auto flex items-center justify-center">
                <p className="text-sm sm:text-base">
                    <span className="font-semibold">Verify your email:</span>{" "}
                    {"You haven't confirmed your account yet."}
                </p>
                <button
                    type="button"
                    onClick={resend}
                    disabled={status === "sending" || cooldown > 0}
                    aria-busy={status === "sending"}
                    className={`shrink-0 rounded-md border ml-2 px-2 py-0.5 text-sm font-medium
                        ${
                            status === "sending" || cooldown > 0
                                ? "opacity-60 cursor-not-allowed border-amber-300 bg-amber-200 dark:border-purple-600 dark:bg-purple-800"
                                : "hover:cursor-pointer border-amber-300 bg-amber-200 hover:bg-amber-300 dark:border-purple-600 dark:bg-purple-800 dark:hover:bg-purple-600"
                        }`}
                >
                    {cooldown > 0
                        ? `${cooldown}s`
                        : status === "sending"
                          ? "Sending..."
                          : "Resend Verification Email"}
                </button>
            </div>
        </div>
    );
}
