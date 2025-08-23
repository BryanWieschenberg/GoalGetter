'use client';

import { useEffect, useRef, useState } from "react";
import TaskAdd from "./modals/TaskAdd";
import CategoryAdd from "./modals/CategoryAdd";
import TagAdd from "./modals/TagAdd";
import TaskEdit from "./modals/TaskEdit";
import CategoryEdit from "./modals/CategoryEdit";
import TagEdit from "./modals/TagEdit";

export default function Tasks({ taskData }: { taskData: any }) {
    const [categories, setCategories] = useState(taskData?.task_categories);
    const [tags, setTags] = useState(taskData?.task_tags);
    const [tasks, setTasks] = useState(taskData?.tasks);
    const [hoveredCat, setHoveredCat] = useState<number | null>(null);
    const createRef = useRef<HTMLDivElement | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState<string | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);

    const tagById = (id?: number) =>
        tags.find((t: any) => t.id === id);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (createRef.current && !createRef.current.contains(e.target as Node)) {
                setCreateOpen(false);
            }
        };
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setCreateOpen(false);
                setModalOpen(null);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    const fetchCategoryData = () => {
        fetch('/api/user/tasks/categories')
            .then((res) => res.json())
            .then((data) => setCategories(data.categories));
    };

    const fetchTagData = () => {
        fetch('/api/user/tasks/tags')
            .then((res) => res.json())
            .then((data) => setTags(data.tags));
    };

    const fetchTaskData = () => {
        fetch('/api/user/tasks/tasks')
            .then((res) => res.json())
            .then((data) => setTasks(data.tasks));
    };

    async function handleTaskSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = new FormData(e.currentTarget);
        const payload = {
            title: form.get("title"),
            description: form.get("description"),
            category_id: form.get("category_id"),
            tag_id: form.get("tag_id") || null,
            due_date: form.get("due_date") || null,
            priority: form.get("priority") || "normal"
        };

        const res = await fetch("/api/user/tasks/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload })
        });

        if (!res.ok) {
            const res_json = await res.json();
            setModalError(res_json.error || "An unknown error occurred.");
        } else {
            fetchTaskData();
            setModalOpen(null);
            setModalError(null);
        }
    }

    async function handleCategorySubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = new FormData(e.currentTarget);

        let color = form.get("color") as string | null;
        color = color ? color.replace(/^#/, "") : null;
        
        const payload = {
            title: form.get("title"),
            color: color
        };

        const res = await fetch("/api/user/tasks/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload })
        });

        if (!res.ok) {
            const res_json = await res.json();
            setModalError(res_json.error || "An unknown error occurred.");
        } else {
            fetchCategoryData();
            setModalOpen(null);
            setModalError(null);
        }
    }

    async function handleTagSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = new FormData(e.currentTarget);
        
        let color = form.get("color") as string | null;
        color = color ? color.replace(/^#/, "") : null;
        
        const payload = {
            title: form.get("title"),
            category_id: form.get("category_id"),
            color: color
        };

        const res = await fetch("/api/user/tasks/tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload })
        });

        if (!res.ok) {
            const res_json = await res.json();
            setModalError(res_json.error || "An unknown error occurred.");
        } else {
            fetchTagData();
            setModalOpen(null);
            setModalError(null);
        }
    }

    return (
        <div>
            {/* Top Section */}
            <div className="border-b-2 border-zinc-300 dark:border-zinc-700 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                    <div ref={createRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setCreateOpen((v) => !v)}
                            className="inline-flex items-center gap-2 rounded-lg text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 px-4 py-1.5 font-medium shadow-sm hover:dark:bg-black dark:hover:dark:bg-white active:opacity-80 hover:cursor-pointer"
                            aria-expanded={createOpen}
                        >
                            <span className="text-lg leading-none font-bold">{'\uFF0B'}</span>
                            Create
                        </button>

                        {createOpen && (
                            <div
                                role="menu"
                                className="absolute z-50 mt-2 w-44 overflow-hidden rounded-lg border border-zinc-300/70 dark:border-zinc-700/70 bg-white dark:bg-zinc-900 shadow-lg"
                            >
                                <button
                                    role="menuitem"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:cursor-pointer"
                                    onClick={() => {
                                        setCreateOpen(false);
                                        setModalOpen("taskAdd");
                                    }}
                                >
                                    Task
                                </button>
                                <button
                                    role="menuitem"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:cursor-pointer"
                                    onClick={() => {
                                        setCreateOpen(false);
                                        setModalOpen("categoryAdd");
                                    }}
                                >
                                    Category
                                </button>
                                <button
                                    role="menuitem"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:cursor-pointer"
                                    onClick={() => {
                                        setCreateOpen(false);
                                        setModalOpen("tagAdd");
                                    }}
                                >
                                    Tag
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 bg-white/70 dark:bg-black/20 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    >
                        ⇅
                    </button>

                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 bg-white/70 dark:bg-black/20 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                        aria-label="Toggle view"
                        title="Toggle view"
                    >
                        👁️
                    </button>

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

            {/* Tasks */}
            <div className="p-3">
                {categories.map((cat: any) => {
                    // Get all categories
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
                                <p className="text-sm text-zinc-500">Add a task with the Create button!</p>
                            ) : (
                                // Get all tasks in this category
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

            {/* Modals */}
            {modalOpen === "categoryAdd" && (
                <CategoryAdd
                    onClose={() => setModalOpen(null)}
                    onSubmit={handleCategorySubmit}
                    modalError={modalError}
                />
            )}
            
            {modalOpen === "tagAdd" && (
                <TagAdd
                    categories={categories}
                    onClose={() => setModalOpen(null)}
                    onSubmit={handleTagSubmit}
                    modalError={modalError}
                />
            )}
            
            {modalOpen === "taskAdd" && (
                <TaskAdd
                    categories={categories}
                    tags={tags}
                    onClose={() => setModalOpen(null)}
                    onSubmit={handleTaskSubmit}
                    modalError={modalError}
                />
            )}
            
            {modalOpen === "taskEdit" && (
                <TaskEdit />
            )}
            
            {modalOpen === "categoryEdit" && (
                <CategoryEdit />
            )}
            
            {modalOpen === "tagEdit" && (
                <TagEdit />
            )}
        </div>
    );
}
