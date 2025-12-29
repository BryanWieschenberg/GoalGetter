"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import EventAdd from "./modals/EventAdd";
import EventCategoryAdd from "./modals/EventCategoryAdd";
import EventEdit from "./modals/EventEdit";
import EventCategoryEdit from "./modals/EventCategoryEdit";
import { Task, Tag, Event, EventCategory } from "@/types/core-types";
import { FiEye, FiChevronLeft, FiChevronRight, FiBell } from "react-icons/fi";
import { FaRegCalendarAlt } from "react-icons/fa";
import {
    startOfWeek,
    parseLocalDate,
    addDays,
    formatWeekRange,
    buildWeekOccurrences,
    getContrastTextColor,
    dayIndexFrom,
} from "@/lib/calendarHelper";
import { AnimatePresence, motion } from "framer-motion";

type calendarData = {
    event_categories: EventCategory[];
    events: Event[];
    tasks: Task[];
    tags: Tag[];
};

export default function Calendar({
    calendarData,
    startWeekPreference,
    modalOpen,
    setModalOpen,
    nowTopServer,
}: {
    calendarData: calendarData;
    startWeekPreference: number;
    modalOpen: string | null;
    setModalOpen: (value: string | null) => void;
    nowTopServer: number;
}) {
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), startWeekPreference));
    const inputRef = useRef<HTMLInputElement>(null);
    const [categories, setCategories] = useState(calendarData.event_categories);
    const [events, setEvents] = useState(calendarData.events);
    const [selectedCategoryRaw, setSelectedCategoryRaw] = useState<EventCategory | null>(null);
    const [selectedEventRaw, setSelectedEventRaw] = useState<Event | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);
    const [nowTop, setNowTop] = useState<number | null>(nowTopServer ?? null);
    const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
    const [eventTimeslot, setEventTimeslot] = useState<{ start: Date; end: Date } | null>(null);
    const [visibleCategories, setVisibleCategories] = useState<number[]>(
        categories?.map((c: EventCategory) => c.id) ?? [],
    );
    const [tooltipsVisible, setTooltipsVisible] = useState(true);

    const [filterOpen, setFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    const weekOccurrences = useMemo(() => {
        const filtered = (events || []).filter((ev: Event) =>
            visibleCategories.includes(ev.category_id),
        );
        return buildWeekOccurrences(filtered || [], weekStart);
    }, [events, weekStart, visibleCategories]);

    const eventMap = useMemo(() => {
        const map: Record<number, Event> = {};
        for (const ev of events) {
            map[ev.id] = ev;
        }
        return map;
    }, [events]);

    const goPrev = () => setWeekStart(addDays(weekStart, -7));
    const goNext = () => setWeekStart(addDays(weekStart, 7));
    const goToday = () => setWeekStart(startOfWeek(new Date(), startWeekPreference));

    const getTasksForDay = (day: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);

        if (dayStart < today) {
            return [];
        }

        const isToday = dayStart.getTime() === today.getTime();

        return calendarData.tasks.filter((task) => {
            if (!task.due_date) {
                return false;
            }

            const due = new Date(task.due_date);
            due.setHours(0, 0, 0, 0);

            if (isToday) {
                return due.getTime() <= today.getTime();
            } else {
                return due.getTime() === dayStart.getTime();
            }
        });
    };

    const getPreselectedCategory = (): EventCategory | null => {
        const showing = categories.filter((c) => visibleCategories.includes(c.id));
        const mainCat = showing.find((c) => c.main);

        if (showing.length === 0) {
            return null;
        } else if (showing.length > 1 && mainCat) {
            return mainCat;
        } else if (showing.length === 1) {
            return showing[0];
        }

        return null;
    };

    const closeAll = () => {
        setModalOpen(null);
        setSelectedCategoryRaw(null);
        setSelectedEventRaw(null);
        setModalError(null);
        setEventTimeslot(null);
    };

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setFilterOpen(false);
            }
        };

        const onKeydown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                inputRef.current?.blur();
                filterRef.current?.blur();
                setFilterOpen(false);
            }
        };

        const updateNowPosition = () => {
            const now = new Date();
            const minutes = now.getHours() * 60 + now.getMinutes();
            const pxPerMinute = 48 / 60;
            setNowTop(minutes * pxPerMinute);
        };

        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKeydown);

        updateNowPosition();
        const interval = setInterval(updateNowPosition, 60 * 1000);

        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKeydown);
            clearInterval(interval);
        };
    }, []);

    const fetchCategoryData = async () => {
        const res = await fetch("/api/user/calendar/categories");
        const data = await res.json();
        setCategories(data.categories);
        setVisibleCategories(data.categories.map((c: EventCategory) => c.id));
    };

    const fetchEventData = () => {
        fetch("/api/user/calendar/events")
            .then((res) => res.json())
            .then((data) => {
                const transformedEvents = data.events.map((event: Event) => ({
                    ...event,
                    recurrence: event.recurrence
                        ? {
                              frequency: event.recurrence.frequency,
                              interval: event.recurrence.interval,
                              weekly: event.recurrence.weekly,
                              count: event.recurrence.count,
                              exceptions: event.recurrence.exceptions,
                              until: event.recurrence.until,
                          }
                        : null,
                }));
                setEvents(transformedEvents);
            });
    };

    async function handleCategoryAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = new FormData(e.currentTarget);

        let color = form.get("color") as string | null;
        color = color ? color.replace(/^#/, "") : null;

        const payload = {
            name: form.get("title"),
            color: color,
        };

        const res = await fetch("/api/user/calendar/categories", {
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

    async function handleEventAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = new FormData(e.currentTarget);

        let color = form.get("color") as string | null;
        color = color ? color.replace(/^#/, "") : null;

        const payload = {
            title: form.get("title"),
            description: form.get("description") || null,
            category_id: form.get("category_id"),
            color: color,
            start_time: form.get("start_time"),
            end_time: form.get("end_time"),
            frequency: form.get("frequency") || null,
            interval: form.get("interval") || null,
            count: form.get("count") || null,
            until: form.get("until") || null,
            weekly: form.getAll("weekly[]"),
            exceptions: form.get("exceptions") || "",
        };

        const res = await fetch("/api/user/calendar/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload }),
        });

        if (!res.ok) {
            const res_json = await res.json();
            setModalError(res_json.error || "An unknown error occurred.");
        } else {
            fetchEventData();
            setModalOpen(null);
            setModalError(null);
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

        const res = await fetch("/api/user/calendar/categories", {
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
            setSelectedCategoryRaw(null);
            setModalError(null);
        }
    }

    async function handleEventEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!selectedEventRaw) {
            return;
        }

        const form = new FormData(e.currentTarget);

        let color = form.get("color") as string | null;
        color = color ? color.replace(/^#/, "") : null;

        const payload = {
            id: selectedEventRaw.id,
            title: form.get("title"),
            description: form.get("description") || null,
            category_id: form.get("category_id"),
            color: color,
            start_time: form.get("start_time"),
            end_time: form.get("end_time"),
            frequency: form.get("frequency") || null,
            interval: form.get("interval") || null,
            count: form.get("count") || null,
            until: form.get("until") || null,
            weekly: form.getAll("weekly[]"),
            exceptions: form.get("exceptions") || "",
        };

        const res = await fetch("/api/user/calendar/events", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload }),
        });

        if (!res.ok) {
            const res_json = await res.json();
            setModalError(res_json.error || "An unknown error occurred.");
        } else {
            fetchEventData();
            setModalOpen(null);
            setSelectedEventRaw(null);
            setModalError(null);
        }
    }

    async function handleCategoryDelete(id: number) {
        const res = await fetch(`/api/user/calendar/categories?id=${id}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            const res_json = await res.json();
            setModalError(res_json.error || "An unknown error occurred.");
        } else {
            fetchCategoryData();
            setModalOpen(null);
            setSelectedCategoryRaw(null);
            setModalError(null);
        }
    }

    async function handleEventDelete(id: number) {
        const res = await fetch(`/api/user/calendar/events?id=${id}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            const res_json = await res.json();
            setModalError(res_json.error || "An unknown error occurred.");
        } else {
            fetchEventData();
            setModalOpen(null);
            setSelectedEventRaw(null);
            setModalError(null);
        }
    }

    return (
        <div>
            <div className="sticky top-0 z-30 bg-zinc-50 dark:bg-[#101012]">
                <div>
                    {/* Main header */}
                    <div className="flex flex-wrap items-center gap-2 border-b-2 border-r border-zinc-300 dark:border-zinc-700 px-3 py-2">
                        <div className="relative w-fit">
                            <button
                                type="button"
                                className="transition rounded-lg ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-3 outline-none cursor-pointer flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                onClick={() => {
                                    if (inputRef.current) {
                                        if (typeof inputRef.current.showPicker === "function") {
                                            inputRef.current.showPicker();
                                        } else {
                                            inputRef.current.focus();
                                        }
                                    }
                                }}
                            >
                                <FaRegCalendarAlt className="w-4 h-4" />
                            </button>
                            <input
                                ref={inputRef}
                                type="date"
                                name="due_date"
                                className="sr-only"
                                style={{
                                    WebkitAppearance: "none",
                                    MozAppearance: "textfield",
                                }}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val) {
                                        const d = parseLocalDate(val);
                                        if (!isNaN(d.getTime())) {
                                            setWeekStart(startOfWeek(d, startWeekPreference));
                                        }
                                    }
                                }}
                            />
                        </div>

                        <div ref={filterRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setFilterOpen((v) => !v)}
                                className="transition inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 bg-white/70 dark:bg-black/20 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:cursor-pointer"
                                aria-haspopup="menu"
                                aria-expanded={filterOpen}
                            >
                                <FiEye className="w-4 h-4" />
                            </button>

                            {filterOpen && (
                                <div
                                    role="menu"
                                    className="absolute z-50 mt-2 w-64 rounded-lg border border-zinc-300/70 dark:border-zinc-700/70 bg-white dark:bg-zinc-900 shadow-lg p-2 flex flex-col gap-1"
                                >
                                    <span className="px-2 mt-1 text-xs text-zinc-500 font-bold">
                                        Categories
                                    </span>

                                    {categories.map((cat: EventCategory) => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center justify-between px-2 py-1 text-sm"
                                        >
                                            <label className="flex items-center gap-2 cursor-pointer">
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
                                                <span>
                                                    {cat.name}{" "}
                                                    {cat.main ? (
                                                        <span className="text-amber-500 font-bold text-[.65rem] pl-1">
                                                            Main
                                                        </span>
                                                    ) : (
                                                        ""
                                                    )}
                                                </span>
                                            </label>

                                            <button
                                                type="button"
                                                className="hover:cursor-pointer ml-2 px-2 py-0.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-600 dark:hover:bg-blue-700 dark:active:bg-blue-800"
                                                onClick={() => {
                                                    setFilterOpen(false);
                                                    setSelectedCategoryRaw(cat);
                                                    setModalOpen("eventCategoryEdit");
                                                }}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    ))}

                                    <div className="h-px my-1 bg-zinc-200 dark:bg-zinc-800" />

                                    <label className="flex items-center gap-2 px-2 py-1 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={tooltipsVisible}
                                            onChange={(e) => setTooltipsVisible(e.target.checked)}
                                        />
                                        Show Upcoming Due Date Bells
                                    </label>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            className="transition inline-flex items-center gap-2 rounded-lg px-3 py-2 text-md ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 bg-white/70 dark:bg-black/20 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:cursor-pointer"
                            onClick={goToday}
                        >
                            Today
                        </button>

                        <div className="flex items-center lg:px-3">
                            <button
                                type="button"
                                className="inline-flex items-center p-1.5 rounded-lg transition hover:rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:cursor-pointer"
                                onClick={goPrev}
                            >
                                <FiChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center p-1.5 rounded-lg transition hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:cursor-pointer"
                                onClick={goNext}
                            >
                                <FiChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="text-md lg:text-xl font-semibold">
                            {formatWeekRange(weekStart, addDays(weekStart, 6))}
                        </div>
                    </div>

                    {/* Tasks & weekday header */}
                    <div className="grid grid-cols-[64px_repeat(7,1fr)] py-[.3rem] border-b border-r bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                        <div className="h-8" />
                        {Array.from({ length: 7 }).map((_, i) => {
                            const day = addDays(weekStart, i);
                            const isToday =
                                day.getFullYear() === new Date().getFullYear() &&
                                day.getMonth() === new Date().getMonth() &&
                                day.getDate() === new Date().getDate();

                            const weekday = new Intl.DateTimeFormat(undefined, {
                                weekday: "short",
                            }).format(day);
                            const dateNum = day.getDate();
                            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                            const tasksDueToday = getTasksForDay(day);

                            return (
                                <div
                                    key={`head-${i}`}
                                    className={`flex flex-col items-center justify-end rounded-md relative ${isWeekend ? "opacity-90" : ""}`}
                                >
                                    <div
                                        className={`h-9 min-w-7 px-2 flex items-center justify-center rounded-xl text-xl font-semibold gap-1
                                            ${isToday ? "bg-blue-600 text-white" : "text-zinc-900 dark:text-zinc-100"}`}
                                    >
                                        <span
                                            className={`text-sm uppercase tracking-wide mr-1 mt-[.225rem]
                                            ${isToday ? "text-zinc-200" : "text-zinc-500 dark:text-zinc-400"}`}
                                        >
                                            {weekday}
                                        </span>
                                        {dateNum}

                                        {tooltipsVisible && tasksDueToday.length > 0 && (
                                            <FiBell
                                                className={`transition w-4 h-4 ml-1 cursor-pointer ${isToday ? "text-slate-400 hover:text-slate-100" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-100"}`}
                                                onMouseEnter={() => setHoveredDayIndex(i)}
                                                onMouseLeave={() => setHoveredDayIndex(null)}
                                                onMouseMove={(e) =>
                                                    setTooltipPos({ x: e.clientX, y: e.clientY })
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <AnimatePresence>
                        {tooltipsVisible &&
                            hoveredDayIndex !== null &&
                            tooltipPos &&
                            (() => {
                                const day = addDays(weekStart, hoveredDayIndex);
                                const tasksDueToday = getTasksForDay(day);

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.2 }}
                                        className="fixed z-50 px-2 py-1 text-sm rounded-md bg-white dark:bg-black text-black dark:text-white border-2 border-zinc-500 shadow-lg max-w-xs"
                                        style={{
                                            top: tooltipPos.y + 12,
                                            left: "auto",
                                            right: `calc(100vw - ${tooltipPos.x}px)`,
                                            transform: "translateX(-8px)",
                                        }}
                                    >
                                        <ul className="space-y-0.5">
                                            {tasksDueToday.map((task) => {
                                                const tag = task.tag_id
                                                    ? calendarData.tags.find(
                                                          (t) => t.id === task.tag_id,
                                                      )
                                                    : null;

                                                return (
                                                    <li
                                                        key={task.id}
                                                        className="truncate flex items-center gap-1"
                                                    >
                                                        {tag && tag.color && (
                                                            <span
                                                                className="font-semibold"
                                                                style={{ color: `#${tag.color}` }}
                                                            >
                                                                [{tag.name}]
                                                            </span>
                                                        )}
                                                        {task.title}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </motion.div>
                                );
                            })()}
                    </AnimatePresence>
                </div>
            </div>

            {/* Calendar cells */}
            <div className="relative grid grid-cols-[64px_repeat(7,1fr)] auto-rows-[48px] overflow-hidden">
                {nowTop !== null &&
                    (() => {
                        const today = new Date();
                        const todayIndex = Array.from({ length: 7 }).findIndex((_, i) => {
                            const d = addDays(weekStart, i);
                            return (
                                d.getFullYear() === today.getFullYear() &&
                                d.getMonth() === today.getMonth() &&
                                d.getDate() === today.getDate()
                            );
                        });

                        if (todayIndex === -1) {
                            return null;
                        }

                        return (
                            <div
                                className="absolute h-0.5 bg-zinc-700 dark:bg-zinc-300 z-20"
                                style={{
                                    top: `${nowTop}px`,
                                    left: `calc(64px + (100% - 64px) / 7 * ${todayIndex})`,
                                    width: `calc((100% - 64px) / 7)`,
                                }}
                            >
                                <div className="absolute -left-1.25 top-1/2 w-3 h-3 rounded-full bg-zinc-700 dark:bg-zinc-300 -translate-y-1/2" />
                            </div>
                        );
                    })()}

                {Array.from({ length: 24 }).map((_, hour) => {
                    const hourLabel = new Intl.DateTimeFormat(undefined, {
                        hour: "numeric",
                    }).format(new Date(2000, 0, 1, hour));

                    return (
                        <div className="contents" key={`row-${hour}`}>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start justify-end pr-2 pt-1 select-none">
                                {hourLabel}
                            </div>

                            {Array.from({ length: 7 }).map((__, i) => {
                                const cellStart = new Date(weekStart);
                                cellStart.setDate(weekStart.getDate() + i);
                                cellStart.setHours(hour, 0, 0, 0);

                                const cellEnd = new Date(cellStart);
                                cellEnd.setHours(cellEnd.getHours() + 1);

                                return (
                                    <div
                                        key={`cell-${hour}-${i}`}
                                        className={`border-l border-zinc-200 dark:border-zinc-800
                                            ${i === 6 ? "border-r" : ""}
                                            ${hour !== 0 ? "border-t border-zinc-200 dark:border-zinc-800" : ""}
                                            ${hour !== 23 ? "border-b border-zinc-200 dark:border-zinc-800" : ""}
                                        `}
                                        onClick={() => {
                                            setEventTimeslot({ start: cellStart, end: cellEnd });
                                            setSelectedCategoryRaw(getPreselectedCategory());
                                            setModalOpen("eventAdd");
                                        }}
                                    />
                                );
                            })}

                            {/* Event blocks */}
                            {weekOccurrences.map((occ) => {
                                const eventRaw = eventMap[occ.id];

                                if (!eventRaw) {
                                    return null;
                                }

                                const leftExpr = `calc(64px + ((100% - 64px) / 7) * ${occ.dayIndex})`;
                                const widthExpr = `calc(((100% - 64px) / 7) - 6px)`;

                                const colIndex = occ._colIndex ?? 0;
                                const colCount = Math.max(1, occ._colCount ?? 1);
                                const widthColExpr = `calc(((${widthExpr}) - 6px) / ${colCount})`;
                                const leftColExpr = `calc(${leftExpr} + 3px + (${widthColExpr} * ${colIndex}) + (4px * ${colIndex}))`;

                                return (
                                    <div
                                        key={`${occ.id}-${occ.start.toISOString()}`}
                                        className={`absolute z-10 rounded-md text-xs overflow-hidden hover:cursor-pointer
                                            ${!occ.color ? "bg-zinc-100 text-black dark:bg-black dark:text-white" : ""}`}
                                        style={{
                                            top: `${occ.top}px`,
                                            left: leftColExpr,
                                            width: widthColExpr,
                                            height: `${occ.height}px`,
                                            ...(occ.color
                                                ? {
                                                      background: `#${occ.color}22`,
                                                      borderColor: `#${occ.color}`,
                                                      color: getContrastTextColor(occ.color),
                                                  }
                                                : {}),
                                        }}
                                        onClick={() => {
                                            setSelectedEventRaw(eventRaw);
                                            setModalOpen("eventEdit");
                                        }}
                                    >
                                        <div className="px-2 py-1">
                                            {occ.title}
                                            {occ.height >= 45 * (48 / 60) && (
                                                <div className="font-light">
                                                    {occ.startLabel} – {occ.endLabel}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {modalOpen === "eventAdd" && eventTimeslot && (
                                <div
                                    className="absolute z-20 border-2 border-blue-500 pointer-events-none rounded-md"
                                    style={{
                                        top: `${(eventTimeslot.start.getHours() * 60 + eventTimeslot.start.getMinutes()) * (48 / 60)}px`,
                                        left: `calc(64px + ((100% - 64px) / 7) * ${dayIndexFrom(eventTimeslot.start, weekStart)})`,
                                        width: `calc(((100% - 64px) / 7) - 6px)`,
                                        height: `${((eventTimeslot.end.getTime() - eventTimeslot.start.getTime()) / (60 * 1000)) * (48 / 60)}px`,
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            {modalOpen === "eventCategoryAdd" && (
                <EventCategoryAdd
                    onClose={closeAll}
                    onSubmit={handleCategoryAdd}
                    modalError={modalError}
                />
            )}

            {modalOpen === "eventAdd" && (
                <EventAdd
                    categories={categories}
                    onClose={closeAll}
                    onSubmit={handleEventAdd}
                    modalError={modalError}
                    preSelectedCategory={selectedCategoryRaw}
                    timeslot={eventTimeslot}
                />
            )}

            {modalOpen === "eventCategoryEdit" && selectedCategoryRaw && (
                <EventCategoryEdit
                    modalError={modalError}
                    onClose={closeAll}
                    onSubmit={handleCategoryEdit}
                    onDelete={handleCategoryDelete}
                    preSelectedCategory={selectedCategoryRaw}
                />
            )}

            {modalOpen === "eventEdit" && selectedEventRaw && (
                <EventEdit
                    categories={categories}
                    modalError={modalError}
                    onClose={closeAll}
                    onSubmit={handleEventEdit}
                    onDelete={handleEventDelete}
                    preSelectedEvent={selectedEventRaw}
                />
            )}
        </div>
    );
}
