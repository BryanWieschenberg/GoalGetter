"use client";

import { useRef, useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";

type EventAddProps = {
    categories: any[];
    tags: any[];
    modalError?: string | null;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    preSelectedCategory: number | null;
};

export default function EventAdd({ categories, tags, modalError, onClose, onSubmit, preSelectedCategory }: EventAddProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>(preSelectedCategory ? String(preSelectedCategory) : "");
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredTags = tags.filter((t) => String(t.category_id) === selectedCategory);

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
                        Create Task
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
                            placeholder="Task name..."
                            name="title"
                        />
                    </div>

                    <div className="grid gap-3">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                            placeholder="Additional details…"
                            rows={3}
                            name="description"
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

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Tag</label>
                            <select
                                name="tag_id"
                                disabled={!selectedCategory}
                                className={
                                    `w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600
                                    ${!selectedCategory ? "bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed text-zinc-500 dark:text-zinc-400" : ""}`
                                }
                                defaultValue=""
                            >
                                <option value="">No tag</option>

                                {selectedCategory &&
                                    filteredTags.map((t) => (
                                        <option
                                            key={t.id}
                                            value={t.id}
                                            style={{ color: t.color ? `#${t.color}` : undefined }}
                                        >
                                            {t.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Due date</label>
                            <div className="relative w-full">
                                <input
                                    ref={inputRef}
                                    type="date"
                                    name="due_date"
                                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 [appearance:none]"
                                    style={{
                                        WebkitAppearance: "none",
                                        MozAppearance: "textfield"
                                    }}
                                />
                                <FaRegCalendarAlt
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
                                    size={18}
                                    onClick={() => {
                                        if (inputRef.current) {
                                            if (typeof inputRef.current.showPicker === "function") {
                                                inputRef.current.showPicker();
                                            } else {
                                                inputRef.current.focus();
                                            }
                                        }
                                    }}
                                />

                                {/* Hide default calendar */}
                                <style jsx>{`
                                    input[type="date"]::-webkit-calendar-picker-indicator {
                                        opacity: 0;
                                        display: none;
                                        -webkit-appearance: none;
                                    }

                                    /* Hide native clear button (optional) */
                                    input[type="date"]::-webkit-clear-button {
                                        display: none;
                                    }

                                    /* Hide in Firefox */
                                    input[type="date"]::-moz-calendar-picker-indicator {
                                        display: none;
                                    }
                                `}</style>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Priority</label>
                            <select
                                name="priority"
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                                defaultValue="normal"
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-2 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="hover:cursor-pointer rounded-lg px-4 py-2 text-sm ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="hover:cursor-pointer rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:opacity-90 active:opacity-80"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
