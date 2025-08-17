import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import SettingsForm from "./SettingsForm";
import authOptions from "@/lib/authOptions";

interface User {
    username: string;
    handle: string;
    email: string;
    provider: string;
}

interface UserSettings {
    theme: string;
    timezone: string;
    notifications_enabled: boolean;
}

export default async function Settings() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/signin");
    }

    const account = await pool.query<User>(
        "SELECT username, handle, email, provider FROM users WHERE id=$1",
        [session.user.id]
    );

    const settingsRes = await pool.query<UserSettings>(
        "SELECT theme FROM user_settings WHERE user_id=$1",
        [session.user.id]
    );

    if (settingsRes.rowCount === 0) {
        redirect("/");
    }

    const settings = settingsRes.rows[0];
    const localProvider = account.rows[0].provider === "" ? true : false;

    return (
        <div className="p-8">
            <h1 className="font-bold text-2xl pb-4">Settings</h1>

            <p><span className="font-bold">Username:</span> {account.rows[0].username}</p>
            <p><span className="font-bold">Handle:</span> @{account.rows[0].handle}</p>
            <p><span className="font-bold">Email:</span> {account.rows[0].email}</p>
            {!localProvider && (<p><span className="font-bold">Source:</span> {account.rows[0].provider}</p>)}

            <hr className="my-6" />

            <h2 className="font-bold text-xl pb-4">User Preferences</h2>

            <SettingsForm initialSettings={settings} />
        </div>
    );
}
