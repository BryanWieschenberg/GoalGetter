import "./globals.css";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOptions";
import pool from "@/lib/db";

export const metadata = {
    title: {
        default: "GoalGetter",
        template: "%s"
    }
};

export default async function BareLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    let theme = "system";
    if (session?.user?.id) {
        const themeRes = await pool.query<{ theme: string }>(
            "SELECT theme FROM user_settings WHERE user_id=$1",
            [session.user.id]
        );
        theme = themeRes.rows[0]?.theme || "system";
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
                    <main>{children}</main>
                </Providers>
            </body>
        </html>
    );
}
