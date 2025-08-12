import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import FacebookProvider from "next-auth/providers/facebook";
import { compare } from "bcrypt";
import pool from "@/lib/db";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: "common", // process.env.AZURE_AD_TENANT_ID!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOKK_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {label: "Email", type: "text"},
                password: {label: "Password", type: "password"},
            },
            // Fetches user trying to login and compares password
            async authorize(credentials) {
                const res = await pool.query(
                    "SELECT * FROM users WHERE email = $1",
                    [credentials?.email]
                ); //TODO:
                const user = res.rows[0]
                if (!user || !credentials?.password) return null; //TODO:
                return await compare(credentials.password, user.password) ? user : null;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login"
    },
    callbacks: {
        async session({session, token}) { //TODO:
            session.user.id = token.sub!;
            return session;
        },
    },
};
