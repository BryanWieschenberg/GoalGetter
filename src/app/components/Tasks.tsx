'use client';

import { useEffect, useRef, useState } from "react";

export default function Tasks({ taskData }: { taskData: any }) {
    const categories = taskData?.task_categories ?? [];
    const tags = taskData?.task_tags ?? [];
    const tasks = taskData?.tasks ?? [];
    const [hoveredCat, setHoveredCat] = useState<number | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const createRef = useRef<HTMLDivElement | null>(null);
    const [taskModalOpen, setTaskModalOpen] = useState(false);

    const tagById = (id?: number) =>
        tags.find((t: any) => t.id === id);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (createRef.current && !createRef.current.contains(e.target as Node)) {
                setCreateOpen(false);
            }
        };
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setCreateOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    return (
        <div>
            <div className="mb-6 border-b-2 border-zinc-300 dark:border-zinc-700 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Create */}
                    <div ref={createRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setCreateOpen((v) => !v)}
                            className="inline-flex items-center gap-2 rounded-lg text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 px-4 py-1.5 font-medium shadow-sm hover:dark:bg-black hover:dark:bg-white active:opacity-80"
                            aria-expanded={createOpen}
                        >
                            <span className="text-lg leading-none">＋</span>
                            Create
                        </button>

                        {createOpen && (
                            <div
                                role="menu"
                                className="absolute z-50 mt-2 w-44 overflow-hidden rounded-lg border border-zinc-300/70 dark:border-zinc-700/70 bg-white dark:bg-zinc-900 shadow-lg"
                            >
                                <button
                                    role="menuitem"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    onClick={() => {
                                        setCreateOpen(false);
                                        setTaskModalOpen(true);
                                    }}
                                >
                                    Task
                                </button>
                                <button
                                    role="menuitem"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    onClick={() => setCreateOpen(false)}
                                >
                                    Category
                                </button>
                                <button
                                    role="menuitem"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    onClick={() => setCreateOpen(false)}
                                >
                                    Tag
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sort */}
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 bg-white/70 dark:bg-black/20 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    >
                        ⇅
                    </button>

                    {/* View toggle (placeholder) */}
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 bg-white/70 dark:bg-black/20 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                        aria-label="Toggle view"
                        title="Toggle view"
                    >
                        👁️
                    </button>

                    {/* Search */}
                    <div className="relative flex-1 min-w-[20px] max-w-[200px]">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                            🔍
                        </span>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full rounded-lg border border-transparent bg-white/80 dark:bg-black/20 pl-9 pr-3 py-2 text-sm outline-none ring-1 ring-zinc-300/70 dark:ring-zinc-700/70 focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                        />
                    </div>
                </div>
            </div>

            <div className="p-8">
                {categories.map((cat: any) => {
                    const catTasks = tasks.filter((t: any) => t.category_id === cat.id);

                    return (
                        <section
                            key={cat.id}
                            className="mb-4 inline-block w-fit rounded-xl border-[.1rem] mr-8 p-4"
                            style={{ borderColor: cat.color ? `#${cat.color}` : undefined }}
                        >
                            <h2
                                className="text-xl font-bold mb-3 flex items-center"
                                style={{ color: cat.color ? `#${cat.color}` : undefined }}
                                onMouseEnter={() => setHoveredCat(cat.id)}
                                onMouseLeave={() => setHoveredCat(null)}
                            >
                                {cat.name}
                                {hoveredCat === cat.id && (
                                    <span className="ml-auto text-red-500">a</span>
                                )}
                            </h2>

                            {catTasks.length === 0 ? (
                                <p className="text-zinc-500">No tasks in this category.</p>
                            ) : (
                                <ul>
                                    {catTasks.map((task: any) => {
                                        const tag = tagById(task.tag_id);
                                        return (
                                            <li
                                                key={task.id}
                                                className="flex items-center w-fit"
                                                style={{ borderColor: cat.color ? `#${cat.color}` : undefined }}
                                            >
                                                <h3
                                                    className="whitespace-nowrap text-sm"
                                                    style={{ color: tag?.color ? `#${tag.color}` : undefined }}
                                                >
                                                    <span>{task.title}</span>
                                                    {task.description && (
                                                        <span className="ml-3 text-zinc-800 dark:text-zinc-200">
                                                            {task.description}
                                                        </span>
                                                    )}
                                                </h3>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>
                    );
                })}
            </div>

            {taskModalOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center"
                    aria-modal="true"
                    role="dialog"
                    aria-labelledby="new-task-title"
                >
                    {/* backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80"
                        onClick={() => setTaskModalOpen(false)}
                    />

                    {/* dialog */}
                    <div className="relative z-[61] w-[90vw] max-w-xl rounded-2xl border-[.2rem] border-zinc-500/70 bg-white dark:bg-zinc-900 shadow-2xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                            <h3 id="new-task-title" className="text-lg font-semibold">Create Task</h3>
                            <button
                                onClick={() => setTaskModalOpen(false)}
                                className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            className="px-5 py-4 space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                // TODO: handle submit
                                setTaskModalOpen(false);
                            }}
                        >
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
                                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select category</option>
                                        {categories.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Tag</label>
                                    <select
                                        name="tag_id"
                                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select tag</option>
                                        {tags.map((t: any) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Due date</label>
                                    <input
                                        type="date"
                                        name="due_date"
                                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                                    />
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
                                    </select>
                                </div>
                            </div>

                            <div className="mt-2 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setTaskModalOpen(false)}
                                    className="rounded-lg px-4 py-2 text-sm ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:opacity-90 active:opacity-80"
                                >
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
