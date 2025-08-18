"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { HiPencil, HiX, HiEye, HiEyeOff } from "react-icons/hi";

interface User {
    username: string;
    handle: string;
    email: string;
    provider: string;
}

interface UserSettings {
    theme: string;
    week_start: string;
}

type EditField = "username" | "handle" | "email";

export default function SettingsForm({ account, initialSettings }: { account: User, initialSettings: UserSettings }) {
    const router = useRouter();

    const original = useRef<UserSettings>(initialSettings);
    const [settings, setSettings] = useState<UserSettings>(initialSettings);
    const [saving, setSaving] = useState(false);

    const [showDelete, setShowDelete] = useState(false);
    const [confirmHandle, setConfirmHandle] = useState("");
    const [deleting, setDeleting] = useState(false);
    const handleMatches = confirmHandle === account.handle.toLowerCase();

    const [editorOpen, setEditorOpen] = useState<EditField | null>(null);
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [editSuccess, setEditSuccess] = useState<string | null>(null);
    const [editUsername, setEditUsername] = useState<string>(account.username);
    const [editHandle, setEditHandle] = useState<string>(account.handle);
    const [editEmail, setEditEmail] = useState<string>(account.email);
    const [editPasswordVisible, setEditPasswordVisible] = useState(false);
    
    const openEditor = (field: EditField) => {
        setEditorOpen(field);
        setEditError(null);
        setEditSuccess(null);
    };
    
    const closeEditor = () => {
        setEditorOpen(null);
        setEditError(null);
        setEditSuccess(null);
        setEditUsername(account.username);
        setEditHandle(account.handle);
        setEditEmail(account.email);
        setEditPasswordVisible(false);
    };

    const handleAccountSave = async (e: React.FormEvent<HTMLFormElement>) => {
        if (!editorOpen) return;
        setEditError(null);
        setEditSuccess(null);

        const form = new FormData(e.currentTarget);
        const newValue = String(form.get("username"));
        const password = String(form.get("password"));

        if (editorOpen === "handle" && !/^[a-z0-9_]+$/i.test(newValue)) {
            setEditError("Handle may only contain letters, numbers, and underscores.");
            return;
        }
        if (editorOpen === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
            setEditError("Please enter a valid email.");
            return;
        }

        try {
            setEditSaving(true);

            const endpoint =
                editorOpen === "username"
                    ? "/api/user/change-username"
                    : editorOpen === "handle"
                    ? "/api/user/change-handle"
                    : "/api/auth/email-change-request";

            const body =
                editorOpen === "email"
                    ? { newEmail: newValue, password }
                    : { [editorOpen]: newValue, password };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setEditError(data?.error ?? "Failed to save changes.");
                setEditSaving(false);
                return;
            }

            if (editorOpen === "email") {
                setEditSuccess("Check your inbox to verify your new email.");
            } else {
                setEditSuccess("Saved!");
            }

            router.refresh();
        } catch (e) {
            setEditError("Unexpected error. Please try again.");
        } finally {
            setEditSaving(false);
        }
    };

    const triggerForgotPassword = async () => {
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: account.email }),
            });
            if (!res.ok) {
                const data = await res.json();
                setEditError(data?.error ?? "Could not start password reset.");
                return;
            }
            setEditSuccess("Password reset email sent.");
        } catch {
            setEditError("Network error. Please try again.");
        }
    };

    const handleSettingSave = async () => {
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

    const onDelete = async () => {
        if (!handleMatches || deleting) return;
        try {
            setDeleting(true);
            const res = await fetch("/api/user/delete", { method: "DELETE" });
            if (!res.ok) {
                setDeleting(false);
                return;
            }
            await signOut({ callbackUrl: "/" });
        } catch {
            setDeleting(false);
        }
    };

    const themeModified = settings.theme !== original.current.theme;
    const weekStartModified = settings.week_start !== original.current.week_start;
    const localProvider = account.provider === "" ? true : false;
    const providerName = account.provider.charAt(0).toUpperCase() + account.provider.slice(1);

    return (
        <div>
            <h1 className="font-bold text-2xl pb-4">Settings</h1>

            <p className="flex items-center gap-2">
                <span className="font-bold">Username:</span> {account.username}
                <button
                    type="button"
                    onClick={() => setEditorOpen("username")}
                    className="rounded ml-1 px-1 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                >
                    <HiPencil className="inline-block justify-center items-center" />
                </button>
            </p>

            <p className="flex items-center gap-2">
                <span className="font-bold">Handle:</span> @{account.handle}
                <button
                    type="button"
                    onClick={() => setEditorOpen("handle")}
                    className="rounded ml-1 px-1 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                >
                    <HiPencil className="inline-block justify-center items-center" />
                </button>
            </p>

            <p className="flex items-center gap-2">
                <span className="font-bold">Email:</span> @{account.email}
                <button
                    type="button"
                    onClick={() => setEditorOpen("email")}
                    className="rounded ml-1 px-1 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                >
                    <HiPencil className="inline-block justify-center items-center" />
                </button>
            </p>

            {!localProvider && (<p><span className="font-bold">Source: </span>{providerName}</p>)}

            {editorOpen && (
                <div className="mt-4 rounded-md border p-4 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold">
                                {editorOpen === "username" && "Change Username"}
                                {editorOpen === "handle" && "Change Handle"}
                                {editorOpen === "email" && "Change Email"}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Enter your new {editorOpen} and your password to confirm.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeEditor}
                            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
                        >
                            <HiX />
                        </button>
                    </div>

                    <div className="mt-3 grid gap-3 max-w-lg">
                        <form onSubmit={handleAccountSave}>
                            <label className="text-sm">
                                <span className="block font-medium mb-1">New {editorOpen}:</span>
                                <input
                                    name="newValue"
                                    type={editorOpen === "email" ? "email" : "text"}
                                    value={editorOpen === "username" ? editUsername : editorOpen === "handle" ? editHandle : editEmail}
                                    required
                                    onChange={(e) => {
                                        if (editorOpen === "username") setEditUsername(e.target.value);
                                        else if (editorOpen === "handle") setEditHandle(e.target.value);
                                        else setEditEmail(e.target.value);
                                    }}
                                    className="w-full border rounded px-3 py-2 dark:bg-black border-zinc-300 dark:border-zinc-700"
                                    placeholder={
                                        editorOpen === "username"
                                            ? "your new username"
                                            : editorOpen === "handle"
                                            ? "@your_new_handle"
                                            : "you@example.com"
                                    }
                                />
                            </label>

                            <label className="text-sm">
                                <span className="block font-medium mb-1 mt-1">Password:</span>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full border rounded px-3 py-2 dark:bg-black border-zinc-300 dark:border-zinc-700"
                                    placeholder="Password"
                                />
                            </label>

                            <div className="flex items-center gap-3 mt-3">
                                <button
                                    type="submit"
                                    disabled={editSaving}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {editSaving ? "Saving..." : "Save"}
                                </button>

                                <button
                                    type="button"
                                    onClick={triggerForgotPassword}
                                    className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    Forgot password
                                </button>
                            </div>
                        </form>
                        {editError && (
                            <p className="text-sm text-red-500">{editError}</p>
                        )}
                        {editSuccess && (
                            <p className="text-sm text-green-500">{editSuccess}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-6">
                <button
                    type="button"
                    onClick={() => setShowDelete(v => !v)}
                    className="rounded-md px-3 py-2 hover:cursor-pointer border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/30"
                >
                    Account Deletion
                </button>

                {showDelete && (
                    <div className="mt-3 rounded-md border p-4 border-red-300 dark:border-red-600">
                        <p className="text-sm text-red-700 dark:text-red-300">
                            Are you sure? This action is permanent and cannot be undone.
                        </p>
                        <p className="mt-2 text-sm">
                            To confirm, type your handle "{account.handle}":
                        </p>

                        <div className="mt-3 relative max-w-md">
                            <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500 pointer-events-none">@</span>
                            <input
                                type="text"
                                value={confirmHandle}
                                onChange={(e) => setConfirmHandle(e.target.value)}
                                placeholder="your-handle"
                                className={`w-full border rounded px-3 py-2 pl-8 dark:bg-black
                                    ${confirmHandle.length > 0
                                        ? handleMatches
                                            ? "border-green-500 focus:outline-none"
                                            : "border-red-500 focus:outline-none"
                                        : "border-zinc-300 dark:border-zinc-700"}`}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={!handleMatches || deleting}
                            className={`mt-4 rounded-md px-4 py-2 text-white transition
                                ${!handleMatches || deleting
                                    ? "bg-red-300 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-700 cursor-pointer"}`}
                        >
                            {deleting ? "Deleting..." : "Delete My Account"}
                        </button>
                    </div>
                )}
            </div>
            
            <hr className="my-6" />

            <h2 className="font-bold text-xl pb-4">User Preferences</h2>

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
                    onClick={handleSettingSave}
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Settings"}
                </button>
            </div>
        </div>
    );
}
