'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="flex justify-between p-2 pl-8 pr-8 border-b border-gray-300 bg-gray-100 text-black">
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 text-white font-bold">GG</Link>
                <Link href="/" className="hover:text-blue-500">Home</Link>
                <Link href="/insights" className="hover:text-blue-500">Insights</Link>
                <Link href="/feed" className="hover:text-blue-500">Feed</Link>
                <Link href="/notifications" className="hover:text-blue-500">Notications</Link>
                <Link href="/messages" className="hover:text-blue-500">Messages</Link>
                <Link href="/profile" className="hover:text-blue-500">Profile</Link>
            </div>
            <div className="flex items-center gap-6">
                {session ? (
                    <Link href="/settings" className="hover:text-blue-500">Settings</Link>
                ) : (
                    <>
                        <Link href="/signup" className="hover:text-blue-500">Sign up</Link>
                        <p>or</p>
                        <Link href="/login" className="hover:text-blue-500">Log in</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
