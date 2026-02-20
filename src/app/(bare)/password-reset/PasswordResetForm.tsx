"use client";

import { useState } from "react";

export default function PasswordResetForm({ token }: { token: string }) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [visible, setVisible] = useState(false);
    const [visible2, setVisible2] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            if (res.ok) {
                setDone(true);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to reset password");
            }
        } catch {
            setError("Network error");
        }
        setSubmitting(false);
    };

    if (done) {
        return <p className="text-green-600 dark:text-green-400">Password successfully reset!</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 w-full max-w-sm mx-auto">
            <div className="relative">
                <input
                    type={visible ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                />
                <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="absolute inset-y-0 right-3 text-zinc-500"
                >
                    {visible ? "Hide" : "Show"}
                </button>
            </div>
            <div className="relative">
                <input
                    type={visible2 ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                />
                <button
                    type="button"
                    onClick={() => setVisible2(!visible2)}
                    className="absolute inset-y-0 right-3 text-zinc-500"
                >
                    {visible2 ? "Hide" : "Show"}
                </button>
            </div>
            {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
            <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-zinc-400"
            >
                {submitting ? "Saving..." : "Save Password"}
            </button>
        </form>
    );
}
