import { auth } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import SettingsForm from "./SettingsForm";

interface User {
    username: string;
    handle: string;
    email: string;
    provider: string;
}

interface UserSettings {
    theme: string;
    week_start: string;
    timezone: string;
}

export default async function Settings() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/signin");
    }

    const account = await pool.query<User>(
        "SELECT username, handle, email, provider FROM users WHERE id=$1",
        [session.user.id],
    );

    const settingsRes = await pool.query<UserSettings>(
        "SELECT theme, week_start, timezone FROM user_settings WHERE user_id=$1",
        [session.user.id],
    );

    if (settingsRes.rowCount === 0) {
        redirect("/");
    }

    return (
        <div className="flex-1 overflow-y-auto p-8">
            <SettingsForm account={account.rows[0]} initialSettings={settingsRes.rows[0]} />
        </div>
    );
}
