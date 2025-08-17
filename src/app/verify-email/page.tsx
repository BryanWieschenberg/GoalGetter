"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState("Verifying...");

    useEffect(() => {
        if (!token) {
            setStatus("No token provided");
            return;
        }
        fetch(`/api/auth/verify-email?token=${token}`)
            .then(res => res.json())
            .then(data => {
                if (data.ok) setStatus("Your email is verified!");
                else setStatus(data.error || "Verification failed");
            })
            .catch(() => setStatus("Error verifying."));
    }, [token]);

    return <div>{status}</div>;
}
