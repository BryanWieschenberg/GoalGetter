'use client';

import { useEffect, useRef, useState } from "react";
import TaskAdd from "./modals/TaskAdd";
import CategoryAdd from "./modals/CategoryAdd";
import TagAdd from "./modals/TagAdd";
import TaskEdit from "./modals/TaskEdit";
import CategoryEdit from "./modals/CategoryEdit";
import TagEdit from "./modals/TagEdit";
import { FiPlus } from "react-icons/fi";

export default function Tasks({ taskData }: { taskData: any }) {
    const [categories, setCategories] = useState(taskData?.task_categories);
    const [tags, setTags] = useState(taskData?.task_tags);
    const [tasks, setTasks] = useState(taskData?.tasks);
    const [hoveredCat, setHoveredCat] = useState<number | null>(null);
    const createRef = useRef<HTMLDivElement | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState<string | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedCategoryRaw, setSelectedCategoryRaw] = useState<category | null>(null);
    const [selectedTaskRaw, setSelectedTaskRaw] = useState<task | null>(null);
    const [selectedTagRaw, setSelectedTagRaw] = useState<tag | null>(null);

    const tagById = (id?: number) =>
        tags.find((t: any) => t.id === id);

    const closeAll = () => {
        setModalOpen(null);
        setSelectedCategory(null);
        setSelectedCategoryRaw(null);
        setSelectedTagRaw(null);
        setSelectedTaskRaw(null);
        setModalError(null);
    }

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
                setSelectedCategory(null);
                setSelectedCategoryRaw(null);
                setSelectedTagRaw(null);
                setSelectedTaskRaw(null);
                setModalError(null);
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

    async function handleCategoryAdd(e: React.FormEvent<HTMLFormElement>) {
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

    async function handleTagAdd(e: React.FormEvent<HTMLFormElement>) {
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

    async function handleTaskAdd(e: React.FormEvent<HTMLFormElement>) {
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
            setSelectedCategory(null);
        }
    }

    async function handleCategoryEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!selectedCategoryRaw) return;

        const form = new FormData(e.currentTarget);

        let color = form.get("color") as string | null;
        color = color ? color.replace(/^#/, "") : null;

        const payload = {
            id: selectedCategoryRaw.id,
            title: form.get("title"),
            color: color
        };

        const res = await fetch("/api/user/tasks/categories", {
            method: "PUT",
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
            setSelectedCategoryRaw(null);
        }
    }

    async function handleTagEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!selectedTagRaw) return;

        const form = new FormData(e.currentTarget);

        let color = form.get("color") as string | null;
        color = color ? color.replace(/^#/, "") : null;

        const payload = {
            id: selectedTagRaw.id,
            title: form.get("title"),
            category_id: form.get("category_id"),
            color: color
        };

        const res = await fetch("/api/user/tasks/tags", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload })
        });

        if (!res.ok) {
            const res_json = await res.json();
            setModalError(res_json.error || "An unknown error occurred.");
        } else {
            fetchTagData();
            setModalOpen("categoryEdit noFade");
            setModalError(null);
            setSelectedTagRaw(null);
        }
    }

    async function handleTaskEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!selectedTaskRaw) return;

        const form = new FormData(e.currentTarget);
        const category_id_str = form.get("category_id");
        const category_id = Number(category_id_str);

        const payload = {
            id: selectedTaskRaw.id,
            title: form.get("title"),
            description: form.get("description"),
            category_id: category_id,
            tag_id: form.get("tag_id") || null,
            due_date: form.get("due_date") || null,
            priority: form.get("priority") || "normal"
        };

        const res = await fetch("/api/user/tasks/tasks", {
            method: "PUT",
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
            setSelectedTaskRaw(null);
        }
    }

    async function handleCategoryDelete(id: number) {
        const res = await fetch(`/api/user/tasks/categories?id=${id}`, {
            method: "DELETE"
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

    async function handleTagDelete(id: number) {
        const res = await fetch(`/api/user/tasks/tags?id=${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const res_json = await res.json();
            setModalError(res_json.error || "An unknown error occurred.");
        } else {
            fetchTagData();
            setModalOpen("categoryEdit noFade");
            setModalError(null);
        }
    }

    async function handleTaskDelete(id: number) {
        const res = await fetch(`/api/user/tasks/tasks?id=${id}`, {
            method: "DELETE"
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
                                        setSelectedCategory(null);
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
                            className={`mb-4 inline-block min-w-[300px] w-fit rounded-xl border-[.1rem] mr-8 p-4 ${selectedCategory === cat.id ? "bg-zinc-100 dark:bg-zinc-900" : ""}`}
                            style={{ borderColor: cat.color ? `#${cat.color}` : undefined }}
                        >
                            <h2
                                className="text-xl font-bold mb-3 flex items-center gap-2"
                                style={{ color: cat.color ? `#${cat.color}` : undefined }}
                                onMouseEnter={() => setHoveredCat(cat.id)}
                                onMouseLeave={() => setHoveredCat(null)}
                            >
                                <span
                                    className={`hover:cursor-pointer ${selectedCategoryRaw?.id === cat.id ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}
                                    onClick={() => {
                                        setSelectedCategoryRaw(cat);
                                        setModalOpen("categoryEdit");
                                    }}
                                >
                                    {cat.name}
                                </span>
                                {hoveredCat === cat.id && (
                                    <FiPlus
                                        className="hover:cursor-pointer"
                                        style={{ color: cat.color ? `#${cat.color}` : undefined }}
                                        onClick={() => {
                                            setSelectedCategory(cat.id);
                                            setModalOpen("taskAdd");
                                        }}
                                    />
                                )}
                            </h2>

                            {catTasks.length === 0 ? (
                                <p className="whitespace-nowrap text-sm text-zinc-500">Add a task with the {"\uFF0B"} button!</p>
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
                                                    <span
                                                        className={`hover:cursor-pointer ${selectedTaskRaw?.id === task.id ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}
                                                        onClick={() => {
                                                            setSelectedTaskRaw(task);
                                                            setModalOpen("taskEdit");
                                                        }}
                                                    >
                                                        {task.title}
                                                    </span>
                                                    
                                                    {task.description && (
                                                        <span className="ml-3 text-zinc-400">
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
                    onClose={closeAll}
                    onSubmit={handleCategoryAdd}
                    modalError={modalError}
                />
            )}
            
            {modalOpen === "tagAdd" && (
                <TagAdd
                    categories={categories}
                    onClose={closeAll}
                    onSubmit={handleTagAdd}
                    modalError={modalError}
                />
            )}
            
            {modalOpen === "taskAdd" && (
                <TaskAdd
                    categories={categories}
                    tags={tags}
                    onClose={closeAll}
                    onSubmit={handleTaskAdd}
                    modalError={modalError}
                    preSelectedCategory={selectedCategory}
                />
            )}
            
            {modalOpen === "taskEdit" && selectedTaskRaw && (
                <TaskEdit
                    categories={categories}
                    tags={tags}
                    modalError={modalError}
                    onClose={closeAll}
                    onSubmit={handleTaskEdit}
                    onDelete={handleTaskDelete}
                    preSelectedTask={selectedTaskRaw}
                />
            )}
            
            {modalOpen?.startsWith("categoryEdit") && selectedCategoryRaw && (
                <CategoryEdit 
                    tags={tags}
                    modalError={modalError}
                    onClose={closeAll}
                    onSubmit={handleCategoryEdit}
                    onDelete={handleCategoryDelete}
                    preSelectedCategory={selectedCategoryRaw}
                    onTagEdit={(tagId) => {
                        const tag = tags.find((t: any) => t.id === tagId);
                        if (tag) setSelectedTagRaw(tag);
                        setModalOpen("tagEdit");
                    }}
                    noFade={modalOpen.includes("noFade")}
                />
            )}

            {modalOpen === "tagEdit" && selectedTagRaw && (
                <TagEdit
                    categories={categories}
                    modalError={modalError}
                    onClose={closeAll}
                    onSubmit={handleTagEdit}
                    onDelete={handleTagDelete}
                    preSelectedTag={selectedTagRaw}
                    onCategoryReturn={() => {
                        const category = categories.find((c: any) => c.id === selectedTagRaw.category_id);
                        if (category) setSelectedCategoryRaw(category);
                        setModalOpen("categoryEdit noFade");
                    }}
                />
            )}
        </div>
    );
}
