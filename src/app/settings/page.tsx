"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Settings() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session === undefined) {
            return;
        }
        if (session === null) {
            router.replace("/login");
        }
    }, [session, router]);

    if (!session) return null;

    return (
        <div className="p-8">
            <h1>Username: {session.user?.name}</h1>
            <p>Email: {session.user?.email}</p>
        </div>
    );
}
