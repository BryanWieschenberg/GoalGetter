"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Settings() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session === null || session === undefined) {
            router.replace("/login");
        }
    }, [session, router]);

    if (!session) return null;

    return (
        <div className="p-8">
            <h1 className="font-bold text-2xl pb-8">Settings</h1>

            <p><span className="font-bold">ID:</span> {session.user?.id}</p>
            <p><span className="font-bold">Username:</span> {session.user?.username}</p>
            <p><span className="font-bold">Handle:</span> @{session.user?.handle}</p>
            <p><span className="font-bold">Email:</span> {session.user?.email}</p>
            <p><span className="font-bold">Source:</span> {session.user?.provider}</p>
        </div>
    );
}
