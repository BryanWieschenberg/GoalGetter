import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import SettingsForm from "./SettingsForm";
import authOptions from "@/lib/authOptions";

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

    const result = await pool.query<UserSettings>(
        "SELECT theme, timezone, notifications_enabled FROM user_settings WHERE user_id=$1",
        [session.user.id]
    );

    if (result.rowCount === 0) {
        redirect("/");
    }

    const settings = result.rows[0];

    return (
        <div className="p-8">
            <h1 className="font-bold text-2xl pb-4">Settings</h1>

            <p><span className="font-bold">ID:</span> {session.user.id}</p>
            <p><span className="font-bold">Username:</span> {session.user.username}</p>
            <p><span className="font-bold">Handle:</span> @{session.user.handle}</p>
            <p><span className="font-bold">Email:</span> {session.user.email}</p>
            <p><span className="font-bold">Source:</span> {session.user.provider}</p>

            <hr className="my-6" />

            <h2 className="font-bold text-xl pb-2">User Preferences</h2>

            <SettingsForm initialSettings={settings} />
        </div>
    );
}
