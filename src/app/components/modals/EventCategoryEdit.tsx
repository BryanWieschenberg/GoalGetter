"use client";

import { useState } from "react";
import { EventCategory } from "@/types/core-types";

type EventCategoryEditProps = {
    modalError?: string | null;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onDelete: (id: number) => void;
    preSelectedCategory: EventCategory;
};

export default function EventCategoryEdit({
    modalError,
    onClose,
    onSubmit,
    onDelete,
    preSelectedCategory,
}: EventCategoryEditProps) {
    const [useCustomColor, setUseCustomColor] = useState(!!preSelectedCategory.color);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center animate-fadeIn"
            aria-modal="true"
            role="dialog"
            aria-labelledby="edit-event-category-title"
        >
            <div className="absolute inset-0 bg-black/50 animate-fadeIn" onClick={onClose} />

            <div className="relative z-[61] w-[90vw] max-w-xl rounded-2xl border-[.2rem] border-zinc-500/70 bg-zinc-100 dark:bg-zinc-900 shadow-2xl animate-slideUp">
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <h3 id="edit-event-category-title" className="text-lg font-semibold">
                            Edit Event Category
                        </h3>
                        {preSelectedCategory.main && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-600 text-xs font-semibold">
                                Main
                            </span>
                        )}
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
                        <strong>Error: </strong>
                        {modalError}
                    </div>
                )}

                <form className="px-5 py-4 space-y-4" onSubmit={onSubmit}>
                    <div className="grid gap-3">
                        <label className="text-sm font-medium">Title *</label>
                        <input
                            autoFocus
                            required
                            type="text"
                            name="title"
                            defaultValue={preSelectedCategory.name}
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                            placeholder="Category name..."
                        />
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
                                defaultValue={
                                    preSelectedCategory.color
                                        ? `#${preSelectedCategory.color}`
                                        : "#ffffff"
                                }
                                className={`h-10 w-14 rounded-md border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-1
                                    ${useCustomColor ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-0"}`}
                                disabled={!useCustomColor}
                            />
                        </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                        <button
                            type="button"
                            onClick={() => onDelete(preSelectedCategory.id)}
                            disabled={preSelectedCategory.main}
                            className={`rounded-lg px-4 py-2 text-sm font-medium 
                                ${
                                    preSelectedCategory.main
                                        ? "bg-zinc-400 dark:bg-zinc-600 text-zinc-900 cursor-not-allowed opacity-60"
                                        : "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 hover:cursor-pointer"
                                }`}
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
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
