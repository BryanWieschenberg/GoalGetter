import "./globals.css";
import Navbar from "./components/Navbar";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOptions";
import pool from "@/lib/db";

export const metadata = {
    title: {
        default: "GoalGetter",
        template: "%s | GoalGetter",
    },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    let theme = "system";
    if (session?.user?.id) {
        const result = await pool.query<{ theme: string }>(
            "SELECT theme FROM user_settings WHERE user_id=$1",
            [session.user.id]
        );
        theme = result.rows[0]?.theme || "system";
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
                    <main>{children}</main>
                </Providers>
            </body>
        </html>
    );
}
