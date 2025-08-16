'use client';

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();
    
    return (
        <nav className="flex justify-between p-2 pl-8 pr-8 border-b border-zinc-300 bg-zinc-100 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-lg font-bold bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black">GG</Link>
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
                <Link href="/insights" className="hover:text-blue-600 dark:hover:text-blue-400">Insights</Link>
                <Link href="/feed" className="hover:text-blue-600 dark:hover:text-blue-400">Feed</Link>
                <Link href="/notifications" className="hover:text-blue-600 dark:hover:text-blue-400">Notications</Link>
                <Link href="/messages" className="hover:text-blue-600 dark:hover:text-blue-400">Messages</Link>
                <Link href="/profile" className="hover:text-blue-600 dark:hover:text-blue-400">Profile</Link>
            </div>
            <div className="flex items-center gap-6">
                {session ? (
                    <>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="hover:text-blue-600 dark:hover:text-blue-400 hover:cursor-pointer"
                        >
                            Sign Out
                        </button>
                        <Link href="/settings" className="hover:text-blue-600 dark:hover:text-blue-400">Settings</Link>
                    </>
                ) : (
                    <>
                        <Link href="/signup" className="hover:text-blue-600 dark:hover:text-blue-400">Sign up</Link>
                        <p>or</p>
                        <Link href="/signin" className="hover:text-blue-600 dark:hover:text-blue-400">Sign in</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
