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
                const { rows } = await pool.query(
                    'SELECT id, email, username, password FROM users WHERE email = $1',
                    [creds.email]
                );
                const user = rows[0];
                if (!user) return null;
                const ok = await bcrypt.compare(creds.password, user.password);
                if (!ok) return null;
                return { id: String(user.id), email: user.email, name: user.username };
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
    }
};

export default authOptions;
