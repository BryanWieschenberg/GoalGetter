"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface UserSettings {
    theme: string;
    week_start: string;
}

export default function SettingsForm({ initialSettings }: { initialSettings: UserSettings }) {
    const router = useRouter();

    const original = useRef<UserSettings>(initialSettings);
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
        router.refresh();
        original.current = settings;
    };

    const themeModified = settings.theme !== original.current.theme;
    const weekStartModified = settings.week_start !== original.current.week_start;

    return (
        <div className="flex flex-col gap-4 max-w-md">
            <label className="flex flex-col">
                <strong>Theme:</strong>
                <div className="flex items-center gap-2">
                    <select
                        value={settings.theme}
                        onChange={e => setSettings(s => ({ ...s, theme: e.target.value }))}
                        className={`border rounded p-2 border-2 dark:bg-black
                            ${themeModified ? "border-yellow-500 dark:border-purple-700" : ""}`}
                    >
                        <option value="system">System</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>

                    {themeModified && (
                        <button
                            type="button"
                            onClick={() => setSettings(s => ({ ...s, theme: original.current.theme }))}
                            className="text-sm ml-4 px-2 py-[.3rem] rounded border border-yellow-500 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:border-purple-700 dark:bg-purple-200 dark:text-purple-800 dark:hover:bg-purple-300"
                            title="Reset Theme"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </label>

            <label className="flex flex-col">
                <strong>Week Start:</strong>
                <div className="flex items-center gap-2">
                    <select
                        value={settings.week_start}
                        onChange={e => setSettings(s => ({ ...s, week_start: e.target.value }))}
                        className={`border rounded p-2 border-2 dark:bg-black
                            ${weekStartModified ? "border-yellow-500 dark:border-purple-700" : ""}`}
                    >
                        <option value="sun">Sunday</option>
                        <option value="mon">Monday</option>
                        <option value="tue">Tuesday</option>
                        <option value="wed">Wednesday</option>
                        <option value="thu">Thursday</option>
                        <option value="fri">Friday</option>
                        <option value="sat">Saturday</option>
                    </select>

                    {weekStartModified && (
                        <button
                            type="button"
                            onClick={() => setSettings(s => ({ ...s, week_start: original.current.week_start }))}
                            className="text-sm ml-4 px-2 py-[.3rem] rounded border border-yellow-500 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:border-purple-700 dark:bg-purple-200 dark:text-purple-800 dark:hover:bg-purple-300"
                            title="Reset Week Start"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </label>
            
            <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700 disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save Settings"}
            </button>
        </div>
    );
}
