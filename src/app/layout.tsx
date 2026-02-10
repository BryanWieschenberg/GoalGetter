import "./globals.css";
import { Providers } from "./Providers";
import { auth } from "@/lib/authOptions";
import pool from "@/lib/db";
import ThemeApplier from "./ThemeApplier";

export const metadata = {
    title: {
        default: "GoalGetter",
        template: "%s",
    },
};

export default async function BareLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    let theme = "system";
    if (session?.user?.id) {
        const themeRes = await pool.query<{ theme: string }>(
            "SELECT theme FROM user_settings WHERE user_id=$1",
            [session.user.id],
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
                                    var darkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                    if (darkTheme) {
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
                <ThemeApplier theme={theme as "system" | "light" | "dark"} />
                <Providers session={session}>
                    <main className="h-screen overflow-hidden flex flex-col">{children}</main>
                </Providers>
            </body>
        </html>
    );
}
