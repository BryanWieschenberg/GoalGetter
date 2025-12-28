import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import NextAuth from "next-auth";
import { generateHandle } from "@/lib/generateHandle";

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    session: { strategy: "jwt", maxAge: 604800 }, // Session lasts 7 days
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
                    image: p.picture
                };
            }
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                handleOrEmail: { label: "Email or Handle", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const creds = credentials as { handleOrEmail: string; password: string } | undefined;

                    if (!creds?.handleOrEmail || !creds?.password)
                        throw new Error("Missing credentials");
                    
                    const queryParam = creds.handleOrEmail.includes("@") ? "email" : "handle";
                    const data = await pool.query(
                        `SELECT id, username, handle, email, password, provider FROM users
                        WHERE ${queryParam} = $1`,
                        [creds.handleOrEmail]
                    );
                    const user = data.rows[0];
                    
                    if (!user)
                        throw new Error("User not found");

                    const ok = await bcrypt.compare(creds.password, user.password);
                    
                    if (!ok)
                        throw new Error("Invalid password");

                    return {
                        email: user.email,
                        handle: user.handle,
                        id: String(user.id),
                        username: user.username,
                        provider: user.provider && user.provider.trim() !== "" ? user.provider : "local"
                    };
                } catch (err) {
                    console.error("Authorization error:", err);
                    return null;
                }
            },
        }),
    ],
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === "production"
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production"
            }
        }
    },
    callbacks: {
        async signIn({ account, profile }) {
            const client = await pool.connect();
            let began = false;
            try {
                if (account && account.provider !== "credentials" && profile && profile.email) {
                    const existing = await client.query(
                        "SELECT id FROM users WHERE provider = $1 AND provider_id = $2",
                        [account.provider, account.providerAccountId]
                    );

                    if (existing.rowCount === 0) {
                        const username = profile.name || profile.email?.split("@")[0];
                        const handle = await generateHandle(username, client);
                        
                        await client.query("BEGIN");
                        began = true;
                        
                        const userId = await client.query(
                            `INSERT INTO users (username, handle, email, email_verified, provider, provider_id)
                            VALUES ($1, $2, $3, $4, $5, $6)
                            RETURNING id`,
                            [username, handle, profile.email, true, account.provider, account.providerAccountId]
                        );
                        
                        await client.query(
                            `INSERT INTO user_settings (user_id, theme)
                            VALUES ($1, 'system')`,
                            [userId.rows[0].id]
                        );
                        
                        await client.query(
                            `INSERT INTO task_categories (user_id, name, sort_order) VALUES
                            ($1, 'My Tasks', 0)`,
                            [userId.rows[0].id]
                        )
                        
                        await client.query(
                            `INSERT INTO event_categories (user_id, name, main)
                            VALUES ($1, $2, $3)`,
                            [userId.rows[0].id, 'Events', true]
                        );

                        await client.query("COMMIT");
                        began = false;
                    }
                }
                return true;
            } catch (e) {
                if (began) { await client.query("ROLLBACK"); }
                console.error("Error in signIn callback:", e);
                return false;
            } finally {
                client.release();
            }
        },
        async jwt({ token, user, account, profile }) {
            if (token.id) return token;
                
            if (account?.provider === "credentials" && user?.id) {
                token.id = String(user.id);
                return token;
            }

            if (account?.type !== "credentials" && account?.provider && account.providerAccountId) {
                const r = await pool.query(
                    "SELECT id FROM users WHERE provider = $1 AND provider_id = $2",
                    [account.provider, account.providerAccountId]
                );
                if (r.rows[0]?.id) {
                    token.id = String(r.rows[0].id);
                    return token;
                }
            }

            const email = (user as any)?.email ?? (profile as any)?.email ?? null;
            if (email) {
                const r = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
                if (r.rows[0]?.id) {
                    token.id = String(r.rows[0].id);
                    return token;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token.id) {
                session.user = session.user || {};
                session.user.id = String(token.id);
            }
            return session;
        }
    }
});
