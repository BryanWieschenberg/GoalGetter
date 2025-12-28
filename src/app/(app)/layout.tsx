import "../globals.css";
import Navbar from "../components/Navbar";
import { auth } from "@/lib/authOptions";
import pool from "@/lib/db";
import VerifyAccount from "../components/VerifyAccount";

export const metadata = {
    title: {
        default: "GoalGetter",
        template: "%s",
    },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    let isVerified = false;

    let theme = "system";
    const hasSession = session?.user?.id ? true : false;
    if (session?.user?.id) {
        const themeRes = await pool.query<{ theme: string }>(
            "SELECT theme FROM user_settings WHERE user_id=$1",
            [session.user.id]
        );
        theme = themeRes.rows[0]?.theme || "system";
        
        const verifiedRes = await pool.query<{ email_verified: boolean }>(
            "SELECT email_verified FROM users WHERE id=$1",
            [session.user.id]
        );
        isVerified = verifiedRes.rows[0]?.email_verified ?? false;
    }

    return (
        <>
            <Navbar hasSession={hasSession} />
            {session?.user?.id && !isVerified && <VerifyAccount />}
            {children}
        </>
    );
}
