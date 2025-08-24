"use client";

import { useState } from "react";

type TaskAddProps = {
    categories: any[];
    modalError?: string | null;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onDelete: (id: number) => void;
    preSelectedTag: tag;
    onCategoryReturn?: () => void;
};

export default function TagEdit({ categories, modalError, onClose, onSubmit, onDelete, preSelectedTag, onCategoryReturn }: TaskAddProps) {
    const [title, setTitle] = useState<string>(preSelectedTag.name);
    const [color, setColor] = useState<string>(preSelectedTag.color ? `#${preSelectedTag.color}` : "#ffffff");
    const [useCustomColor, setUseCustomColor] = useState<boolean>(!!preSelectedTag.color);
    const [selectedCategory, setSelectedCategory] = useState<string>(preSelectedTag.category_id);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center"
            aria-modal="true"
            role="dialog"
            aria-labelledby="edit-tag-title"
        >
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            <div className="relative z-[61] w-[90vw] max-w-xl rounded-2xl border-[.2rem] border-zinc-500/70 bg-zinc-100 dark:bg-zinc-900 shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onCategoryReturn}
                            className="text-lg px-2 font-bold rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-300 dark:hover:dark:bg-zinc-700"
                            aria-label="Return to Category Editor"
                        >
                            &lt;
                        </button>
                        <h3 id="edit-tag-title" className="text-lg font-semibold">
                            Edit Tag
                        </h3>
                    </div>
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
                            name="title"
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                            placeholder="Tag name..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-3">
                        <label className="text-sm font-medium">Color</label>
                        <input
                            type="color"
                            id="tagColor"
                            name="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="h-10 w-14 rounded-md border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-1 cursor-pointer"
                        />
                    </div>

                    <div className="grid gap-3">
                        <label className="text-sm font-medium">Category *</label>
                        <select
                            name="category_id"
                            required
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                        >
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

                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                        <button
                            type="button"
                            onClick={() => onDelete(preSelectedTag.id)}
                            className="hover:cursor-pointer rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 active:bg-red-800"
                        >
                            Delete
                        </button>

                        <div className="flex items-center gap-2">
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
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
