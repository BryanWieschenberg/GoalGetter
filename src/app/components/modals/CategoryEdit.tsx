"use client";

import { useRef, useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";

type TaskAddProps = {
    tags: any[];
    modalError?: string | null;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onDelete: (id: number) => void;
    preSelectedCategory: category;
    onTagEdit?: (tagId: number) => void;
};

export default function CategoryEdit({ tags, modalError, onClose, onSubmit, onDelete, preSelectedCategory, onTagEdit }: TaskAddProps) {
    const [title, setTitle] = useState<string>(preSelectedCategory.name);
    const [color, setColor] = useState<string>(preSelectedCategory.color ? `#${preSelectedCategory.color}` : "#ffffff");
    const [useCustomColor, setUseCustomColor] = useState<boolean>(!!preSelectedCategory.color);
    const [selectedTag, setSelectedTag] = useState<number | null>(null);

    const filteredTags = tags.filter((t) => t.category_id === preSelectedCategory.id);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center animate-fadeIn"
            aria-modal="true"
            role="dialog"
            aria-labelledby="edit-category-title"
        >
            <div
                className="absolute inset-0 bg-black/50 animate-fadeIn"
                onClick={onClose}
            />

            <div className="relative z-[61] w-[90vw] max-w-xl rounded-2xl border-[.2rem] border-zinc-500/70 bg-zinc-100 dark:bg-zinc-900 shadow-2xl animate-slideUp">
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 id="edit-category-title" className="text-lg font-semibold">
                        Edit Category
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
                    {/* Title */}
                    <div className="grid gap-3">
                        <label className="text-sm font-medium">Title *</label>
                        <input
                            required
                            type="text"
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                            placeholder="Category name..."
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Color Picker */}
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
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className={`h-10 w-14 rounded-md border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-1
                                    ${useCustomColor ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-0"}`}
                                disabled={!useCustomColor}
                            />
                        </div>
                    </div>

                    {/* Tag Selector */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Tags in this category</label>
                        <select
                            name="tag_id"
                            value={selectedTag ?? ""}
                            onChange={(e) => setSelectedTag(e.target.value ? Number(e.target.value) : null)}
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                        >
                            <option value="">No tag selected</option>
                            {filteredTags.map((t) => (
                                <option
                                    key={t.id}
                                    value={t.id}
                                    style={{ color: t.color ? `#${t.color}` : undefined }}
                                >
                                    {t.name}
                                </option>
                            ))}
                        </select>

                        {/* Edit Tag button appears only if a tag is selected */}
                        {selectedTag && (
                            <button
                                type="button"
                                onClick={() => onTagEdit && onTagEdit(selectedTag)}
                                className="mt-2 px-3 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                            >
                                Edit Tag
                            </button>
                        )}
                    </div>

                    {/* Bottom buttons */}
                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                        <button
                            type="button"
                            onClick={() => onDelete(preSelectedCategory.id)}
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
