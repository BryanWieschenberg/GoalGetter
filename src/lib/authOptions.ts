import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import type { AuthOptions } from "next-auth";

const authOptions: AuthOptions = {
    session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // Session lasts 7 days
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: "Credentials",
            credentials: { email: {}, password: {} },
            async authorize(creds) {
                if (!creds?.email || !creds?.password) return null;
                const data = await pool.query('SELECT id, username, handle, email, password, provider FROM users WHERE email = $1', [creds.email]);
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
