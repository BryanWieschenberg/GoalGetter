"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const payload = {
            username: String(form.get("username") || ""),
            handle: String(form.get("handle") || ""),
            email: String(form.get("email") || ""),
            password: String(form.get("password") || ""),
            confirmPassword: String(form.get("confirmPassword") || "")
        };

        const gre = (window as any).grecaptcha;
        if (!gre) {
            alert("reCAPTCHA not loaded yet. Please try again in a moment.");
            return;
        }

        gre.ready(async () => {
            try {
                const token = await gre.execute(
                    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
                    { action: "signup" }
                );

                const res = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...payload, recaptchaToken: token })
                });

                const data = await res.json();
                if (!res.ok) {
                    alert(data.error || "Signup failed");
                    return;
                }
                const loginRes = await signIn("credentials", {
                    redirect: false,
                    email: payload.email,
                    password: payload.password
                });

                if (loginRes?.ok) {
                    router.replace("/");
                } else {
                    alert("Signed up, but auto-login failed. Please sign in.");
                }
            } catch (err) {
                console.error(err);
                alert("Problem running reCAPTCHA. Try again.");
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
            try { delete (window as any).grecaptcha; } catch {}
        };
    }, []);


    return (
        <div className="flex items-center justify-center">
            <div className="w-full max-w-md p-8 shadow">
                <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>

                <form className="space-y-4" onSubmit={handleSignup}>
                    <input
                        name="username"
                        type="text"
                        placeholder="Username"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                        required
                        autoComplete="username"
                    />

                    <input
                        name="handle"
                        type="text"
                        placeholder="Handle (e.g. @bryan)"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                        required
                    />

                    <div className="relative">
                        <input
                            name="password"
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Password"
                            className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring focus:border-blue-300"
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            aria-label={passwordVisible ? "Hide password" : "Show password"}
                        >
                            {passwordVisible ? "🙈" : "👁️"}
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            name="confirmPassword"
                            type={confirmPasswordVisible ? "text" : "password"}
                            placeholder="Confirm Password"
                            className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring focus:border-blue-300"
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                            aria-label={confirmPasswordVisible ? "Hide password" : "Show password"}
                        >
                            {confirmPasswordVisible ? "🙈" : "👁️"}
                        </button>
                    </div>

                    <input
                        name="email"
                        type="email"
                        placeholder="E-mail address"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                        required
                        autoComplete="email"
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="pt-4 text-center">or you can sign up with</p>
                <div className="pt-4">
                    <button
                        type="button"
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-2 border rounded py-2 hover:bg-gray-50"
                    >
                        <span className="w-5 h-5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                                <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.84-6.84C35.9 2.7 30.34 0 24 0 14.64 0 6.4 5.84 2.54 14.22l7.98 6.19C12.3 13.32 17.74 9.5 24 9.5z"/>
                                <path fill="#34A853" d="M46.5 24c0-1.61-.15-3.15-.43-4.63H24v9.1h12.65c-.54 2.92-2.14 5.4-4.55 7.06l7.02 5.46C43.72 37.14 46.5 30.96 46.5 24z"/>
                                <path fill="#FBBC05" d="M10.52 28.41c-.62-1.86-.98-3.84-.98-5.91s.36-4.05.98-5.91l-7.98-6.19C.9 13.93 0 18.82 0 24s.9 10.07 2.54 14.22l7.98-6.19z"/>
                                <path fill="#EA4335" d="M24 48c6.48 0 11.91-2.15 15.88-5.84l-7.02-5.46c-2.03 1.36-4.65 2.15-8.86 2.15-6.26 0-11.7-3.82-13.48-9.06l-7.98 6.19C6.4 42.16 14.64 48 24 48z"/>
                                <path fill="none" d="M0 0h48v48H0z"/>
                            </svg>
                        </span>
                        Google
                    </button>
                </div>
            </div>
        </div>
    );
}
