import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import type { AuthOptions } from "next-auth";
import { generateHandle } from "@/lib/generateHandle";

const authOptions: AuthOptions = {
    session: { strategy: "jwt", maxAge: 604800 }, // Session lasts 7 days
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            profile(profile) {
                return {
                    id: profile.sub,
                    email: profile.email,
                    provider: "google",
                    image: profile.picture,
                    given_name: profile.given_name,
                    family_name: profile.family_name,
                };
            }
        }),
        Credentials({
            name: "Credentials",
            credentials: { handleOrEmail: {}, password: {} },
            async authorize(creds) {
                if (!creds?.handleOrEmail || !creds?.password) return null;
                
                const queryParam = creds.handleOrEmail.includes("@") ? "email" : "handle";
                const data = await pool.query(
                    `SELECT id, username, handle, email, password, provider FROM users
                    WHERE ${queryParam} = $1`,
                    [creds.handleOrEmail]
                );
                const user = data.rows[0];
                if (!user) return null;

                const ok = await bcrypt.compare(creds.password, user.password);
                if (!ok) return null;

                return {
                    email: user.email,
                    handle: user.handle,
                    id: String(user.id),
                    username: user.username,
                    provider: user.provider && user.provider.trim() !== "" ? user.provider : "local"
                };
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
            console.log("REACHED");
            if (account && profile && account.provider !== "credentials") {
                console.log("REACHED");
                const existing = await pool.query(
                    "SELECT id FROM users WHERE provider = $1 AND provider_id = $2",
                    [account.provider, account.providerAccountId]
                );
                console.log(profile);
                console.log(existing.rowCount);

                if (!existing.rowCount) {
                    const username = profile.name || profile.email?.split("@")[0] || "user";
                    const handle = await generateHandle(username);
                    console.log("DATA:", handle, username);
                    await pool.query(
                        `INSERT INTO users (username, handle, email, provider, provider_id)
                        VALUES ($1, $2, $3, $4, $5)`,
                        [username, handle, profile.email, account.provider, account.providerAccountId]
                    );
                }

                // TODO: add profile name update, if user updates their name on google
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.handle = user.handle;
                token.email = user.email;
                token.provider = user.provider || "local";
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
                session.user.handle = token.handle as string;
                session.user.email = token.email as string;
                session.user.provider = token.provider as string;
            }
            return session;
        }
    }
};

export default authOptions;
