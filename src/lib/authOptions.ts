import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import NextAuth from "next-auth";
import { generateHandle } from "@/lib/generateHandle";

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 days
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            profile(p) {
                return {
                    id: p.sub,
                    email: p.email,
                    name: p.name,
                    image: p.picture,
                };
            },
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                handleOrEmail: { label: "Email or Handle", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const creds = credentials as
                        | { handleOrEmail: string; password: string }
                        | undefined;

                    if (!creds?.handleOrEmail || !creds?.password) {
                        throw new Error("Missing credentials");
                    }

                    const isEmail = creds.handleOrEmail.includes("@");
                    const query = isEmail
                        ? `SELECT id, username, handle, email, password, provider
                           FROM users WHERE email = $1`
                        : `SELECT id, username, handle, email, password, provider
                           FROM users WHERE handle = $1`;

                    const data = await pool.query(query, [creds.handleOrEmail]);
                    const user = data.rows[0];

                    if (!user) {
                        return null;
                    }

                    const ok = await bcrypt.compare(creds.password, user.password);

                    if (!ok) {
                        return null;
                    }

                    return { id: String(user.id) };
                } catch (err) {
                    console.error("[AUTH DEBUG] Authorization error:", err);
                    return null;
                }
            },
        }),
    ],
    cookies: {
        sessionToken: {
            name:
                process.env.NODE_ENV === "production"
                    ? "__Secure-next-auth.session-token"
                    : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    callbacks: {
        async signIn({ account, profile }) {
            if (!account || account.provider === "credentials") {
                return true;
            }

            if (!profile?.email) {
                console.error("No email in OAuth profile");
                return false;
            }

            const client = await pool.connect();
            try {
                await client.query("BEGIN");
                const existing = await client.query(
                    `SELECT id FROM users WHERE provider = $1 AND provider_id = $2 FOR UPDATE`,
                    [account.provider, account.providerAccountId],
                );

                if (existing.rowCount === 0) {
                    const username = profile.name || profile.email.split("@")[0];
                    const handle = await generateHandle(username, client);

                    const userId = await client.query(
                        `INSERT INTO users (username, handle, email, email_verified, provider, provider_id)
                         VALUES ($1, $2, $3, $4, $5, $6)
                         ON CONFLICT (provider, provider_id) DO NOTHING
                         RETURNING id`,
                        [
                            username,
                            handle,
                            profile.email,
                            true,
                            account.provider,
                            account.providerAccountId,
                        ],
                    );

                    await Promise.all([
                        client.query(`INSERT INTO user_settings (user_id) VALUES ($1)`, [
                            userId.rows[0].id,
                        ]),
                        client.query(
                            `INSERT INTO task_categories (user_id, sort_order) VALUES ($1, 0)`,
                            [userId.rows[0].id],
                        ),
                        client.query(
                            `INSERT INTO event_categories (user_id, main) VALUES ($1, true)`,
                            [userId.rows[0].id],
                        ),
                    ]);
                }

                await client.query("COMMIT");
                return true;
            } catch (err) {
                await client.query("ROLLBACK");
                console.error("Error in signIn callback:", err);
                return false;
            } finally {
                client.release();
            }
        },
        async jwt({ token, user, account }) {
            if (token.id) {
                return token;
            }

            if (account?.provider === "credentials" && user?.id) {
                token.id = String(user.id);
                return token;
            }

            if (account?.type !== "credentials" && account?.provider && account.providerAccountId) {
                const r = await pool.query(
                    "SELECT id FROM users WHERE provider = $1 AND provider_id = $2",
                    [account.provider, account.providerAccountId],
                );
                if (r.rows[0]?.id) {
                    token.id = String(r.rows[0].id);
                    return token;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token.id) {
                session.user.id = String(token.id);
            }
            return session;
        },
    },
});
