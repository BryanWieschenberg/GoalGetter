"use client";

import { useState } from "react";

interface UserSettings {
    theme: string;
    timezone: string;
    notifications_enabled: boolean;
}

export default function SettingsForm({ initialSettings }: { initialSettings: UserSettings }) {
    const [settings, setSettings] = useState<UserSettings>(initialSettings);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await fetch("/api/user/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
        });
        setSaving(false);
    };

    return (
        <div className="flex flex-col gap-4 max-w-md">
            <label className="flex flex-col">
                Theme:
                <select
                    value={settings.theme}
                    onChange={e => setSettings(s => ({ ...s, theme: e.target.value }))}
                    className="border rounded p-2"
                >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </label>

            <label className="flex flex-col">
                Timezone:
                <input
                    type="text"
                    value={settings.timezone}
                    onChange={e => setSettings(s => ({ ...s, timezone: e.target.value }))}
                    className="border rounded p-2"
                />
            </label>

            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={settings.notifications_enabled}
                    onChange={e => setSettings(s => ({ ...s, notifications_enabled: e.target.checked }))}
                />
                Enable notifications
            </label>

            <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save Settings"}
            </button>
        </div>
    );
}
