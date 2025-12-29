"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiEye, HiEyeOff } from "react-icons/hi";

export default function SignInForm() {
    const router = useRouter();

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotSubmitting, setForgotSubmitting] = useState(false);
    const [forgotMessage, setForgotMessage] = useState<string | null>(null);

    const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setForgotSubmitting(true);
        setForgotMessage(null);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail }),
            });
            if (res.ok) {
                setForgotMessage("Check your email for reset instructions.");
            } else {
                setForgotMessage("Could not process request.");
            }
        } catch {
            setForgotMessage("Error sending request.");
        }
        setForgotSubmitting(false);
    };

    const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        const form = new FormData(e.currentTarget);
        const handleOrEmail = String(form.get("handleOrEmail"));
        const password = String(form.get("password"));

        const gre = window.grecaptcha;
        if (!gre) {
            setError("reCAPTCHA not loaded yet. Please try again in a moment");
            setSubmitting(false);
            return;
        }

        gre.ready(async () => {
            try {
                const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

                if (!siteKey) {
                    throw new Error("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not defined.");
                }

                const token = await gre.execute(siteKey, {
                    action: "signin",
                });

                const res = await fetch("/api/auth/signin", {
                    method: "POST",
                    body: JSON.stringify({ token }),
                    headers: { "Content-Type": "application/json" },
                });

                if (!res.ok) {
                    setError("Failed reCAPTCHA check");
                    setSubmitting(false);
                    return;
                }

                const loginRes = await signIn("credentials", {
                    redirect: false,
                    handleOrEmail: handleOrEmail,
                    password: password,
                });

                if (loginRes?.ok) {
                    router.replace("/");
                    router.refresh();
                } else {
                    setError("Invalid credentials");
                    setSubmitting(false);
                }
            } catch (e) {
                console.error(e);
                setError("Could not run reCAPTCHA");
                setSubmitting(false);
            }
        });
    };

    useEffect(() => {
        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
        script.async = true;
        document.body.appendChild(script);

        return () => {
            script.remove();
            document.querySelector(".grecaptcha-badge")?.remove();
            const w = window as Window & { grecaptcha?: unknown };
            try {
                delete w.grecaptcha;
            } catch (err) {
                if (process.env.NODE_ENV === "development") {
                    console.error("Failed to delete grecaptcha:", err);
                }
            }
        };
    }, []);

    return (
        <div className="flex justify-center pt-8">
            <div className="max-w-md w-full p-8 border-2 rounded-2xl">
                <h1 className={`text-2xl font-bold text-center ${error ? "mb-3" : "mb-8"}`}>
                    Sign In
                </h1>

                {error && (
                    <div className="mb-6 rounded px-4 py-3 bg-red-100 border-red-400 text-red-700 dark:bg-red-900 border dark:border-red-500 dark:text-red-300">
                        <span className="font-bold">Error: </span>
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSignin}>
                    <input
                        name="handleOrEmail"
                        type="text"
                        placeholder="@handle or Email Address"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 dark:focus:border-blue-700 dark:focus:ring-blue-600"
                        required
                        autoComplete="email"
                    />

                    <div className="relative">
                        <input
                            name="password"
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Password"
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 dark:focus:border-blue-700 dark:focus:ring-blue-600"
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center text-zinc-500"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            aria-label={passwordVisible ? "Hide password" : "Show password"}
                        >
                            {passwordVisible ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-2 rounded ${submitting ? "cursor-not-allowed bg-zinc-200 dark:bg-zinc-800" : "bg-blue-500 hover:bg-blue-600 hover:cursor-pointer text-white"}`}
                    >
                        {submitting ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="pt-4 flex justify-between text-blue-500">
                    <button
                        type="button"
                        onClick={() => setForgotOpen(true)}
                        className="hover:cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        Forgot password?
                    </button>
                    <Link href="/signup" className="hover:text-blue-600 dark:hover:text-blue-400">
                        Sign up
                    </Link>
                </div>
                <p className="pt-4 text-center">Or you can sign in with:</p>
                <div className="pt-4">
                    <button
                        type="button"
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-2 border rounded py-2 hover:cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                        <span className="w-5 h-5">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 48 48"
                                className="w-5 h-5"
                            >
                                <path
                                    fill="#4285F4"
                                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.84-6.84C35.9 2.7 30.34 0 24 0 14.64 0 6.4 5.84 2.54 14.22l7.98 6.19C12.3 13.32 17.74 9.5 24 9.5z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M46.5 24c0-1.61-.15-3.15-.43-4.63H24v9.1h12.65c-.54 2.92-2.14 5.4-4.55 7.06l7.02 5.46C43.72 37.14 46.5 30.96 46.5 24z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M10.52 28.41c-.62-1.86-.98-3.84-.98-5.91s.36-4.05.98-5.91l-7.98-6.19C.9 13.93 0 18.82 0 24s.9 10.07 2.54 14.22l7.98-6.19z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M24 48c6.48 0 11.91-2.15 15.88-5.84l-7.02-5.46c-2.03 1.36-4.65 2.15-8.86 2.15-6.26 0-11.7-3.82-13.48-9.06l-7.98 6.19C6.4 42.16 14.64 48 24 48z"
                                />
                                <path fill="none" d="M0 0h48v48H0z" />
                            </svg>
                        </span>
                        Google
                    </button>
                </div>
            </div>

            {forgotOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center animate-fadeIn"
                    aria-modal="true"
                    role="dialog"
                    aria-labelledby="forgot-password-title"
                >
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/50 animate-fadeIn"
                        onClick={() => setForgotOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative z-[61] w-[90vw] max-w-md rounded-2xl border-[.2rem] border-zinc-500/70 bg-zinc-100 dark:bg-zinc-900 shadow-2xl animate-slideUp">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 id="forgot-password-title" className="text-lg font-semibold">
                                Reset Password
                            </h2>
                            <button
                                type="button"
                                onClick={() => setForgotOpen(false)}
                                className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleForgot} className="px-5 py-4 space-y-4">
                            <input
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                                required
                            />

                            <button
                                type="submit"
                                disabled={forgotSubmitting}
                                className="w-full py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 hover:cursor-pointer"
                            >
                                {forgotSubmitting ? "Sending..." : "Send Reset Link"}
                            </button>

                            {forgotMessage && (
                                <p className="mt-2 text-sm text-center">{forgotMessage}</p>
                            )}
                        </form>

                        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 px-5 py-4">
                            <button
                                type="button"
                                onClick={() => setForgotOpen(false)}
                                className="hover:cursor-pointer rounded-lg px-4 py-2 text-sm ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
