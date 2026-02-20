"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TaskAdd from "./modals/TaskAdd";
import TaskCategoryAdd from "./modals/TaskCategoryAdd";
import TagAdd from "./modals/TagAdd";
import TaskEdit from "./modals/TaskEdit";
import TaskCategoryEdit from "./modals/TaskCategoryEdit";
import TagEdit from "./modals/TagEdit";
import { TaskCategory, Task, Tag } from "@/types/core-types";
import { formatPgDate, daysUntil, dueColor, getPriorityClasses } from "@/lib/tasksHelper";
import { FiPlus, FiSearch } from "react-icons/fi";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import { HiCheck } from "react-icons/hi2";
import { LuArrowUpDown } from "react-icons/lu";
import { BiFilterAlt } from "react-icons/bi";

export default function Tasks({
    task_categories,
    tags,
    setTags,
    tasks,
    setTasks,
    modalOpen,
    setModalOpen,
    hasMore,
    setHasMore,
    loadMoreTasks,
    loadingMore,
}: {
    task_categories: TaskCategory[];
    tags: Tag[];
    setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    modalOpen: string | null;
    setModalOpen: (value: string | null) => void;
    hasMore: boolean;
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
    loadMoreTasks: () => void;
    loadingMore: boolean;
}) {
    const [categories, setCategories] = useState(task_categories);
    const [hoveredCat, setHoveredCat] = useState<number | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [highlightedBox, setHighlightedBox] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedCategoryRaw, setSelectedCategoryRaw] = useState<TaskCategory | null>(null);
    const [selectedTaskRaw, setSelectedTaskRaw] = useState<Task | null>(null);
    const [selectedTagRaw, setSelectedTagRaw] = useState<Tag | null>(null);
    const [completingTaskIds, setCompletingTaskIds] = useState<number[]>([]);
    const [isReorderingTask, setIsReorderingTask] = useState(false);
    const [isReorderingCategory, setIsReorderingCategory] = useState(false);
    const [sortMode, setSortMode] = useState<
        "orderAsc" | "orderDesc" | "dueAsc" | "dueDesc" | "priorityAsc" | "priorityDesc"
    >("orderAsc");
    const [sortOpen, setSortOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [visibleCategories, setVisibleCategories] = useState<number[]>(
        task_categories?.map((c: TaskCategory) => c.id) ?? [],
    );
    const allPriorities = ["low", "normal", "high", "urgent"];
    const [visiblePriorities, setVisiblePriorities] = useState<string[]>(allPriorities);
    const [dueFilter, setDueFilter] = useState<"all" | "tomorrow" | "week" | "none">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const createRef = useRef<HTMLDivElement | null>(null);
    const sortRef = useRef<HTMLDivElement | null>(null);
    const filterRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const tagById = (id?: number | null) => tags.find((t: Tag) => t.id === id);

    const priorityRank: Record<string, number> = { urgent: 3, high: 2, normal: 1, low: 0 };

    const closeAll = useCallback(() => {
        setModalOpen(null);
        setSelectedCategory(null);
        setSelectedCategoryRaw(null);
        setSelectedTagRaw(null);
        setSelectedTaskRaw(null);
        setModalError(null);
        setHighlightedBox(null);
    }, [setModalOpen]);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (createRef.current && !createRef.current.contains(e.target as Node)) {
                setCreateOpen(false);
            }
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setSortOpen(false);
            }
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setFilterOpen(false);
            }
        };
        const onKeydown = (e: KeyboardEvent) => {
            const active = document.activeElement as HTMLElement | null;
            const isTyping = active?.tagName === "INPUT" || active?.tagName === "TEXTAREA";

            if (e.key === "/" && !isTyping) {
                e.preventDefault();
                searchInputRef.current?.focus();
                return;
            }

            if (active === searchInputRef.current) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    searchInputRef.current?.blur();
                }
                return;
            }

            if (isTyping) {
                return;
            }

            if (e.key === "Escape") {
                setCreateOpen(false);
                setSortOpen(false);
                setFilterOpen(false);
                closeAll();
            } else if (e.key === "t") {
                setCreateOpen(false);
                setSortOpen(false);
                setFilterOpen(false);
                setModalOpen("taskAdd");
            } else if (e.key === "c") {
                setCreateOpen(false);
                setSortOpen(false);
                setFilterOpen(false);
                setModalOpen("taskCategoryAdd");
            } else if (e.key === "g") {
                setCreateOpen(false);
                setSortOpen(false);
                setFilterOpen(false);
                setModalOpen("tagAdd");
            } else if (e.key === "s") {
                e.preventDefault();
                setSortOpen((v) => !v);
                setCreateOpen(false);
                setFilterOpen(false);
            } else if (e.key === "v" || e.key === "f") {
                e.preventDefault();
                setFilterOpen((v) => !v);
                setCreateOpen(false);
                setSortOpen(false);
            } else if (e.key === "e") {
                setCreateOpen(false);
                setSortOpen(false);
                setFilterOpen(false);
                setModalOpen("eventAdd");
            }
        };
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKeydown);

        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKeydown);
        };
    }, [closeAll, setModalOpen]);

    const fetchCategoryData = async () => {
        const res = await fetch("/api/user/tasks/categories");
        const data = await res.json();
        setCategories(data.categories);
        setVisibleCategories(data.categories.map((c: TaskCategory) => c.id));
    };

    const fetchTagData = () => {
        fetch("/api/user/tasks/tags")
            .then((res) => res.json())
            .then((data) => setTags(data.tags));
    };

    const fetchTaskData = () => {
        const count = Math.max(tasks.length + 1, 50);
        fetch(`/api/user/tasks/tasks?limit=${count}&offset=0`)
            .then((res) => res.json())
            .then((data) => {
                setTasks(data.tasks);
                setHasMore(data.hasMore);
            });
    };

    async function handleCategoryAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = new FormData(e.currentTarget);

        let color = form.get("color") as string | null;
        color = color ? color.replace(/^#/, "") : null;

        const payload = {
            title: form.get("title"),
            color: color,
        };

        const res = await fetch("/api/user/tasks/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload }),
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
            color: color,
        };

        const res = await fetch("/api/user/tasks/tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload }),
        });

        if (!res.ok) {
            const res_json = await res.json();
            setModalError(res_json.error || "An unknown error occurred.");
        } else {
            fetchTagData();
            setModalOpen(selectedCategory ? "taskCategoryEdit noFade" : null);
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
            priority: form.get("priority") || "normal",
        };

        const res = await fetch("/api/user/tasks/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload }),
        });

        if (!res.ok) {
            const res_json = await res.json();
            setModalError(res_json.error || "An unknown error occurred.");
        } else {
            fetchTaskData();
            setModalOpen(null);
            setModalError(null);
            setSelectedCategory(null);
            setHighlightedBox(null);
        }
    }

    async function handleCategoryEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!selectedCategoryRaw) {
            return;
        }

        const form = new FormData(e.currentTarget);

        let color = form.get("color") as string | null;
        color = color ? color.replace(/^#/, "") : null;

        const payload = {
            id: selectedCategoryRaw.id,
            title: form.get("title"),
            color: color,
        };

        const res = await fetch("/api/user/tasks/categories", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload }),
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

        if (!selectedTagRaw) {
            return;
        }

        const form = new FormData(e.currentTarget);

        let color = form.get("color") as string | null;
        color = color ? color.replace(/^#/, "") : null;

        const payload = {
            id: selectedTagRaw.id,
            title: form.get("title"),
            category_id: form.get("category_id"),
            color: color,
        };

        const res = await fetch("/api/user/tasks/tags", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload }),
        });

        if (!res.ok) {
            const res_json = await res.json();
            setModalError(res_json.error || "An unknown error occurred.");
        } else {
            fetchTagData();
            setModalOpen("taskCategoryEdit noFade");
            setModalError(null);
            setSelectedTagRaw(null);
        }
    }

    async function handleTaskEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!selectedTaskRaw) {
            return;
        }

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
            priority: form.get("priority") || "normal",
        };

        const res = await fetch("/api/user/tasks/tasks", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload }),
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
            method: "DELETE",
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
            method: "DELETE",
        });

        if (!res.ok) {
            const res_json = await res.json();
            setModalError(res_json.error || "An unknown error occurred.");
        } else {
            fetchTagData();
            setModalOpen("taskCategoryEdit noFade");
            setModalError(null);
        }
    }

    async function handleTaskDelete(id: number) {
        const res = await fetch(`/api/user/tasks/tasks?id=${id}`, {
            method: "DELETE",
        });

        const res_json = await res.json();
        if (!res.ok) {
            setModalError(res_json.error || "An unknown error occurred.");
        } else {
            fetchTaskData();
            if (res_json.category?.id) {
                setVisibleCategories((prev) => [...prev, res_json.category.id]);
            }
            setModalOpen(null);
            setModalError(null);
        }
    }

    async function handleCompleteTask(id: number) {
        setCompletingTaskIds((prev) => [...prev, id]);

        setTimeout(async () => {
            const res = await fetch(`/api/user/tasks/tasks?id=${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const res_json = await res.json();
                setModalError(res_json.error || "An unknown error occurred.");
                setCompletingTaskIds((prev) => prev.filter((tid) => tid !== id));
            } else {
                fetchTaskData();
                setModalError(null);
            }
        }, 300);
    }

    async function handleReorderTask(id: number, direction: "up" | "down") {
        if (isReorderingTask) {
            return;
        }
        setIsReorderingTask(true);

        try {
            const res = await fetch("/api/user/tasks/tasks/reorder", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ task_id: id, direction }),
            });

            if (!res.ok) {
                const msg = await res.json().catch(() => ({}));
                setModalError(msg.error || "An unknown error occurred.");
                return;
            }

            fetchTaskData();
        } catch {
            setModalError("Network error while reordering.");
        } finally {
            setIsReorderingTask(false);
        }
    }

    async function handleReorderCategory(id: number, direction: "up" | "down") {
        if (isReorderingCategory) {
            return;
        }
        setIsReorderingCategory(true);

        try {
            const res = await fetch("/api/user/tasks/categories/reorder", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category_id: id, direction }),
            });

            if (!res.ok) {
                const msg = await res.json().catch(() => ({}));
                setModalError(msg.error || "An unknown error occurred.");
                return;
            }

            fetchCategoryData();
        } catch {
            setModalError("Network error while reordering category.");
        } finally {
            setIsReorderingCategory(false);
        }
    }

    return (
        <div>
            {/* Top Section */}
            <div className="sticky top-0 z-30 border-b-2 border-r border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#101012] px-3 py-2 mb-1">
                <div className="flex flex-wrap items-center gap-2">
                    <div ref={createRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setCreateOpen((v) => !v)}
                            className={`transition duration-320 inline-flex items-center gap-2 rounded-lg text-white dark:text-zinc-900 px-4 py-[.46rem] font-medium text-md shadow-sm active:opacity-40 hover:cursor-pointer ${createOpen ? "bg-[#4bd1ff]" : "bg-zinc-900 dark:bg-zinc-100 hover:bg-[#4bd1ff] dark:hover:bg-[#4bd1ff]"}`}
                            aria-expanded={createOpen}
                        >
                            <span className="text-lg leading-none font-bold">{"\uFF0B"}</span>
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
                                        setModalOpen("taskCategoryAdd");
                                    }}
                                >
                                    Task Category
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
                                <button
                                    role="menuitem"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:cursor-pointer"
                                    onClick={() => {
                                        setCreateOpen(false);
                                        setModalOpen("eventCategoryAdd");
                                    }}
                                >
                                    Calendar Category
                                </button>
                                <button
                                    role="menuitem"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:cursor-pointer"
                                    onClick={() => {
                                        setCreateOpen(false);
                                        setModalOpen("eventAdd");
                                    }}
                                >
                                    Event
                                </button>
                            </div>
                        )}
                    </div>

                    <div ref={sortRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setSortOpen((v) => !v)}
                            className="transition hover:cursor-pointer inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 hover:bg-zinc-200 dark:hover:bg-zinc-800 bg-white/70 dark:bg-black/20"
                        >
                            <LuArrowUpDown className="w-4 h-4" />
                        </button>

                        {sortOpen && (
                            <div
                                role="menu"
                                className="absolute z-50 mt-2 w-44 overflow-hidden rounded-lg border border-zinc-300/70 dark:border-zinc-700/70 bg-white dark:bg-zinc-900 shadow-lg"
                            >
                                {[
                                    { key: "orderAsc", label: "Sort Order (Asc)" },
                                    { key: "orderDesc", label: "Sort Order (Des)" },
                                    { key: "dueAsc", label: "Due Date (Asc)" },
                                    { key: "dueDesc", label: "Due Date (Des)" },
                                    { key: "priorityAsc", label: "Priority (Asc)" },
                                    { key: "priorityDesc", label: "Priority (Des)" },
                                ].map((opt) => (
                                    <button
                                        key={opt.key}
                                        role="menuitem"
                                        className={`w-full text-left px-3 py-2 text-sm 
                                            ${sortMode === opt.key ? "bg-zinc-300 dark:bg-zinc-700" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:cursor-pointer"}`}
                                        onClick={() => {
                                            if (sortMode !== opt.key) {
                                                setSortMode(opt.key as typeof sortMode);
                                                setSortOpen(false);
                                            }
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div ref={filterRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setFilterOpen((v) => !v)}
                            className="transition inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 bg-white/70 dark:bg-black/20 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:cursor-pointer"
                        >
                            <BiFilterAlt className="w-4 h-4" />
                        </button>

                        {filterOpen && (
                            <div
                                role="menu"
                                className="absolute z-50 mt-2 w-60 rounded-lg border border-zinc-300/70 dark:border-zinc-700/70 bg-white dark:bg-zinc-900 shadow-lg p-2 flex flex-col gap-1"
                            >
                                <span className="px-2 mt-2 text-xs text-zinc-500 font-bold">
                                    Due Date
                                </span>
                                {["all", "tomorrow", "week", "none"].map((opt) => (
                                    <button
                                        key={opt}
                                        className={`px-2 py-1 text-sm text-left 
                                            ${dueFilter === opt ? "bg-zinc-200 dark:bg-zinc-700" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:cursor-pointer"}`}
                                        onClick={() => setDueFilter(opt as typeof dueFilter)}
                                    >
                                        {opt === "all"
                                            ? "All"
                                            : opt === "tomorrow"
                                              ? "Tomorrow"
                                              : opt === "week"
                                                ? "This Week"
                                                : "No Due Date"}
                                    </button>
                                ))}

                                <span className="px-2 mt-2 text-xs text-zinc-500 font-bold">
                                    Priority
                                </span>
                                {allPriorities.map((p) => (
                                    <label
                                        key={p}
                                        className="flex items-center gap-2 px-2 py-1 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={visiblePriorities.includes(p)}
                                            onChange={() => {
                                                setVisiblePriorities((prev) =>
                                                    prev.includes(p)
                                                        ? prev.filter((x) => x !== p)
                                                        : [...prev, p],
                                                );
                                            }}
                                        />
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </label>
                                ))}

                                <span className="px-2 text-xs text-zinc-500 font-bold">
                                    Categories
                                </span>
                                {categories.map((cat: TaskCategory) => (
                                    <label
                                        key={cat.id}
                                        className="flex items-center gap-2 px-2 py-1 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={visibleCategories.includes(cat.id)}
                                            onChange={() => {
                                                setVisibleCategories((prev) =>
                                                    prev.includes(cat.id)
                                                        ? prev.filter((id) => id !== cat.id)
                                                        : [...prev, cat.id],
                                                );
                                            }}
                                        />
                                        {cat.name}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative flex-1 min-w-[20px] max-w-[200px]">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                            <FiSearch className="w-4 h-4" />
                        </span>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search..."
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full rounded-lg border border-transparent bg-white/70 dark:bg-black/30 pl-9 pr-3 py-[.52rem] text-sm outline-none ring-1 focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600
                                ${searchQuery.trim() !== "" ? "ring-2 ring-zinc-300 dark:ring-zinc-700" : "ring-zinc-200 dark:ring-zinc-800"}`}
                        />
                    </div>
                </div>
            </div>

            {/* Tasks */}
            <div className="p-1.5">
                {categories
                    .filter((cat: TaskCategory) => {
                        if (visibleCategories.length === 0) {
                            return false;
                        }
                        return visibleCategories.includes(cat.id);
                    })
                    .map((cat: TaskCategory) => {
                        // Get all categories
                        let catTasks = tasks
                            .filter((t: Task) => t.category_id === cat.id)
                            .filter((t: Task) => {
                                if (
                                    visiblePriorities.length === 0 ||
                                    !visiblePriorities.includes(t.priority)
                                ) {
                                    return false;
                                }

                                const days = t.due_date ? daysUntil(t.due_date) : null;

                                if (dueFilter === "tomorrow") {
                                    if (days === null) {
                                        return true;
                                    } else if (days > 1) {
                                        return false;
                                    }
                                } else if (dueFilter === "week") {
                                    if (days === null) {
                                        return true;
                                    } else if (days > 7) {
                                        return false;
                                    }
                                } else if (dueFilter === "none") {
                                    if (days !== null) {
                                        return false;
                                    }
                                }

                                if (searchQuery.trim() !== "") {
                                    const q = searchQuery.toLowerCase();
                                    const title = t.title?.toLowerCase() ?? "";
                                    const desc = t.description?.toLowerCase() ?? "";
                                    if (!title.includes(q) && !desc.includes(q)) {
                                        return false;
                                    }
                                }

                                return true;
                            });

                        catTasks = [...catTasks].sort((a, b) => {
                            if (sortMode === "dueAsc") {
                                if (!a.due_date && !b.due_date) {
                                    return 0;
                                } else if (!a.due_date) {
                                    return 1;
                                } else if (!b.due_date) {
                                    return -1;
                                }
                                return (
                                    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
                                );
                            }
                            if (sortMode === "dueDesc") {
                                if (!a.due_date && !b.due_date) {
                                    return 0;
                                } else if (!a.due_date) {
                                    return -1;
                                } else if (!b.due_date) {
                                    return 1;
                                }
                                return (
                                    new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
                                );
                            } else if (sortMode === "priorityAsc") {
                                return (
                                    (priorityRank[a.priority] ?? 0) -
                                    (priorityRank[b.priority] ?? 0)
                                );
                            } else if (sortMode === "priorityDesc") {
                                return (
                                    (priorityRank[b.priority] ?? 0) -
                                    (priorityRank[a.priority] ?? 0)
                                );
                            } else if (sortMode === "orderDesc") {
                                return (b.sort_order ?? 0) - (a.sort_order ?? 0);
                            } else {
                                return 0;
                            }
                        });

                        return (
                            <section
                                key={cat.id}
                                className={`mb-3 inline-block min-w-[300px] w-fit rounded-xl border-[.1rem] mr-1.5 p-4 ${highlightedBox === cat.id ? "bg-zinc-100 dark:bg-zinc-900" : ""}`}
                                style={{ borderColor: cat.color ? `#${cat.color}` : undefined }}
                            >
                                <h2
                                    className="text-xl font-bold mb-3 flex items-center gap-2"
                                    style={{ color: cat.color ? `#${cat.color}` : undefined }}
                                    onMouseEnter={() => setHoveredCat(cat.id)}
                                    onMouseLeave={() => setHoveredCat(null)}
                                >
                                    <div className="flex items-center w-fit text-black dark:text-white">
                                        <div className="flex flex-col items-center mr-2 leading-none">
                                            <HiChevronUp
                                                className="text-zinc-400 hover:text-black dark:text-zinc-600 dark:hover:text-white hover:cursor-pointer -mb-[.1rem]"
                                                onClick={() =>
                                                    !isReorderingCategory &&
                                                    handleReorderCategory(cat.id, "up")
                                                }
                                            />
                                            <HiChevronDown
                                                className="text-zinc-400 hover:text-black dark:text-zinc-600 dark:hover:text-white hover:cursor-pointer -mt-[.1rem]"
                                                onClick={() =>
                                                    !isReorderingCategory &&
                                                    handleReorderCategory(cat.id, "down")
                                                }
                                            />
                                        </div>

                                        <span
                                            className={`hover:cursor-pointer ${selectedCategoryRaw?.id === cat.id ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}
                                            style={{
                                                color: cat.color ? `#${cat.color}` : undefined,
                                            }}
                                            onClick={() => {
                                                setSelectedCategory(cat.id);
                                                setSelectedCategoryRaw(cat);
                                                setModalOpen("taskCategoryEdit");
                                            }}
                                        >
                                            {cat.name}
                                        </span>
                                    </div>
                                    {hoveredCat === cat.id && (
                                        <FiPlus
                                            className="hover:cursor-pointer"
                                            style={{
                                                color: cat.color ? `#${cat.color}` : undefined,
                                            }}
                                            onClick={() => {
                                                setSelectedCategory(cat.id);
                                                setModalOpen("taskAdd");
                                                setHighlightedBox(cat.id);
                                            }}
                                        />
                                    )}
                                </h2>

                                {catTasks.length === 0 ? (
                                    <p className="whitespace-nowrap text-sm text-zinc-500">
                                        No tasks in this category.
                                    </p>
                                ) : (
                                    // Get all tasks in this category
                                    <ul>
                                        {catTasks.map((task: Task) => {
                                            const tag = tagById(task.tag_id);

                                            return (
                                                <li
                                                    key={task.id}
                                                    className={`flex items-center gap-1.5 transition-all duration-700
                                                    ${completingTaskIds.includes(task.id) ? "opacity-0 translate-x-10" : "opacity-100 translate-x-0"}`}
                                                    style={{
                                                        borderColor: cat.color
                                                            ? `#${cat.color}`
                                                            : undefined,
                                                    }}
                                                >
                                                    <button
                                                        onClick={() => handleCompleteTask(task.id)}
                                                        className={`h-5 w-5 rounded-full border-[.14rem] border-current flex-shrink-0 hover:cursor-pointer transition
                                                        ${getPriorityClasses(task.priority)}
                                                        ${completingTaskIds.includes(task.id) ? "animate-[popSpin_0.6s]" : ""}
                                                    `}
                                                    >
                                                        {completingTaskIds.includes(task.id) && (
                                                            <HiCheck className="w-3 h-3 text-emerald-300 dark:text-emerald-700" />
                                                        )}
                                                    </button>

                                                    <div className="flex flex-col items-center w-8 text-xs">
                                                        {task.due_date ? (
                                                            <>
                                                                <span
                                                                    className={`font-semibold leading-none ${dueColor(daysUntil(task.due_date))}`}
                                                                >
                                                                    {daysUntil(task.due_date) ?? ""}
                                                                </span>
                                                                <span>
                                                                    {task.due_date
                                                                        ? formatPgDate(
                                                                              task.due_date,
                                                                          )
                                                                        : ""}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-xs text-transparent leading-none select-none">
                                                                    --
                                                                </span>
                                                                <span className="text-xs text-transparent leading-none select-none">
                                                                    --
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col items-center mr-2">
                                                        <HiChevronUp
                                                            className={`text-zinc-400 dark:text-zinc-600 hover:cursor-pointer ${
                                                                sortMode === "orderAsc" ||
                                                                sortMode === "orderDesc"
                                                                    ? "hover:text-black dark:hover:text-white"
                                                                    : "opacity-0 pointer-events-none"
                                                            }`}
                                                            onClick={() => {
                                                                if (
                                                                    !isReorderingTask &&
                                                                    (sortMode === "orderAsc" ||
                                                                        sortMode === "orderDesc")
                                                                ) {
                                                                    const dir =
                                                                        sortMode === "orderDesc"
                                                                            ? "down"
                                                                            : "up";
                                                                    handleReorderTask(task.id, dir);
                                                                }
                                                            }}
                                                        />
                                                        <HiChevronDown
                                                            className={`text-zinc-400 dark:text-zinc-600 hover:cursor-pointer ${
                                                                sortMode === "orderAsc" ||
                                                                sortMode === "orderDesc"
                                                                    ? "hover:text-black dark:hover:text-white"
                                                                    : "opacity-0 pointer-events-none"
                                                            }`}
                                                            onClick={() => {
                                                                if (
                                                                    !isReorderingTask &&
                                                                    (sortMode === "orderAsc" ||
                                                                        sortMode === "orderDesc")
                                                                ) {
                                                                    const dir =
                                                                        sortMode === "orderDesc"
                                                                            ? "up"
                                                                            : "down";
                                                                    handleReorderTask(task.id, dir);
                                                                }
                                                            }}
                                                        />
                                                    </div>

                                                    <h3
                                                        className={`whitespace-nowrap text-sm
                                                    ${completingTaskIds.includes(task.id) ? "animate-[confettiBurst_0.7s]" : ""}`}
                                                    >
                                                        <span
                                                            className={`hover:cursor-pointer ${selectedTaskRaw?.id === task.id ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}
                                                            onClick={() => {
                                                                setSelectedTaskRaw(task);
                                                                setModalOpen("taskEdit");
                                                            }}
                                                        >
                                                            <span
                                                                className="font-bold"
                                                                style={{
                                                                    color: tag?.color
                                                                        ? `#${tag.color}`
                                                                        : undefined,
                                                                }}
                                                            >
                                                                {tag ? `[${tag.name}] ` : ""}
                                                            </span>
                                                            {task.title}
                                                        </span>
                                                        {task.description && (
                                                            <span className="ml-2 text-xs text-zinc-400">
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

            {hasMore && (
                <div className="flex justify-center py-4">
                    <button
                        onClick={loadMoreTasks}
                        disabled={loadingMore}
                        className="px-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loadingMore ? "Loading..." : "Load More Tasks"}
                    </button>
                </div>
            )}

            {/* Modals */}
            {modalOpen === "taskCategoryAdd" && (
                <TaskCategoryAdd
                    onClose={closeAll}
                    onSubmit={handleCategoryAdd}
                    modalError={modalError}
                />
            )}

            {modalOpen?.startsWith("tagAdd") && (
                <TagAdd
                    categories={categories}
                    onClose={closeAll}
                    onSubmit={handleTagAdd}
                    modalError={modalError}
                    preSelectedCategory={modalOpen.includes("noFade") ? selectedCategory : null}
                    onCategoryReturn={() => {
                        if (selectedCategory) {
                            const category = categories.find(
                                (c: TaskCategory) => c.id === selectedCategory,
                            );
                            if (category) {
                                setSelectedCategoryRaw(category);
                            }
                            setModalOpen("taskCategoryEdit noFade");
                        }
                    }}
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

            {modalOpen?.startsWith("taskCategoryEdit") && selectedCategoryRaw && (
                <TaskCategoryEdit
                    tags={tags}
                    modalError={modalError}
                    onClose={closeAll}
                    onSubmit={handleCategoryEdit}
                    onDelete={handleCategoryDelete}
                    preSelectedCategory={selectedCategoryRaw}
                    onTagAdd={() => setModalOpen("tagAdd noFade")}
                    onTagEdit={(tagId) => {
                        const tag = tags.find((t: Tag) => t.id === tagId);
                        if (tag) {
                            setSelectedTagRaw(tag);
                        }
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
                        const category = categories.find(
                            (c: TaskCategory) => c.id === selectedTagRaw.category_id,
                        );
                        if (category) {
                            setSelectedCategoryRaw(category);
                        }
                        setModalOpen("taskCategoryEdit noFade");
                    }}
                />
            )}
        </div>
    );
}
