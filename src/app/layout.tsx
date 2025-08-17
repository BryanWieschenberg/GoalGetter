import "./globals.css";
import Navbar from "./components/Navbar";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOptions";
import pool from "@/lib/db";
import VerifyAccount from "./components/VerifyAccount";

export const metadata = {
    title: {
        default: "GoalGetter",
        template: "%s | GoalGetter",
    },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    let isVerified = false;

    let theme = "system";
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
        <html lang="en" className={theme} suppressHydrationWarning>
            <head>
                {theme === "system" && (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function() {
                                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                    if (prefersDark) {
                                        document.documentElement.classList.add('dark');
                                    } else {
                                        document.documentElement.classList.remove('dark');
                                    }
                                })();
                            `,
                        }}
                    />
                )}
            </head>
            <body>
                <Providers session={session}>
                    <Navbar />
                    {session?.user?.id && !isVerified && (<VerifyAccount />)}
                    <main>{children}</main>
                </Providers>
            </body>
        </html>
    );
}
