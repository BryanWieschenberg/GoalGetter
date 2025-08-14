import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            username: string;
            handle: string;
            email: string;
            provider: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        id: string;
        username: string;
        handle: string;
        email: string;
        provider: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
        handle: string;
        email: string;
        provider: string;
    }
}
