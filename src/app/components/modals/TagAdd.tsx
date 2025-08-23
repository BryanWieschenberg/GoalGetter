"use client";

import { useState } from "react";

type TagAddProps = {
    categories: any[];
    modalError?: string | null;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function TagAdd({ categories, modalError, onClose, onSubmit }: TagAddProps) {
    const [useCustomColor, setUseCustomColor] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center animate-fadeIn"
            aria-modal="true"
            role="dialog"
            aria-labelledby="new-task-title"
        >
            <div
                className="absolute inset-0 bg-black/50 animate-fadeIn"
                onClick={onClose}
            />

            <div className="relative z-[61] w-[90vw] max-w-xl rounded-2xl border-[.2rem] border-zinc-500/70 bg-zinc-100 dark:bg-zinc-900 shadow-2xl animate-slideUp">
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 id="new-task-title" className="text-lg font-semibold">
                        Create Tag
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {modalError && (
                    <div className="px-5 py-3 bg-red-300 text-black dark:bg-red-800 dark:text-white">
                        <strong>Error: </strong>{modalError}
                    </div>
                )}

                <form className="px-5 py-4 space-y-4" onSubmit={onSubmit}>
                    <div className="grid gap-3">
                        <label className="text-sm font-medium">Title *</label>
                        <input
                            required
                            type="text"
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                            placeholder="Tag name..."
                            name="title"
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Category *</label>
                            <select
                                name="category_id"
                                required
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                            >
                                <option value="" disabled hidden className="text-zinc-400">
                                    Select category
                                </option>
                                {categories.map((c) => (
                                    <option
                                        key={c.id}
                                        value={c.id}
                                        style={{ color: c.color ? `#${c.color}` : undefined }}
                                    >
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <label className="text-sm font-medium">Color</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="useCustomColor"
                                name="useCustomColor"
                                checked={useCustomColor}
                                onChange={(e) => setUseCustomColor(e.target.checked)}
                                className="h-4 w-4"
                            />
                            <span className="text-sm">Custom color?</span>

                            <input
                                type="color"
                                id="categoryColor"
                                name="color"
                                defaultValue="#ffffff"
                                className={`h-10 w-14 rounded-md border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-1
                                    ${useCustomColor ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-0"}`}
                                disabled={!useCustomColor}
                            />
                        </div>
                    </div>

                    <div className="mt-2 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:opacity-90 active:opacity-80"
                        >
                            Create Tag
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
