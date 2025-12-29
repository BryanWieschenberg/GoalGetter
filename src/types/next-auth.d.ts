import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: { id: string } & DefaultSession["user"];
    }
    interface User extends DefaultUser {
        providerId?: string;
        email?: string;
        name?: string;
        image?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email?: string;
    }
}
