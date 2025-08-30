'use client';

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

export default function Navbar({hasSession}: {hasSession: boolean}) {
    return (
        <nav className="flex justify-between p-2 pl-8 pr-8 border-b border-zinc-300 bg-zinc-100 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
            <div className="flex items-center gap-6">
                <Link
                    href="/"
                    className="flex items-center justify-center -mb-1 -mt-1"
                >
                    <Image
                        src="/goalgetter.png"
                        alt="GoalGetter"
                        width={48}
                        height={48}
                        className="object-contain transition-none hover:spinJump"
                    />
                </Link>

                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Home</Link>
                <Link href="/insights" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Insights</Link>
                <Link href="/feed" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Feed</Link>
                <Link href="/notifications" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Notications</Link>
                <Link href="/messages" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Messages</Link>
                <Link href="/profile" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Profile</Link>
            </div>
            <div className="flex items-center gap-6">
                {hasSession ? (
                    <>
                        <button
                            onClick={async () => {
                                await signOut({ redirect: false });
                                window.location.href = "/signin";
                            }}
                            className="hover:text-blue-600 dark:hover:text-blue-400 hover:cursor-pointer transition"
                        >
                            Sign Out
                        </button>
                        <Link href="/settings" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Settings</Link>
                    </>
                ) : (
                    <>
                        <Link href="/signup" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Sign up</Link>
                        <p>or</p>
                        <Link href="/signin" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Sign in</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
