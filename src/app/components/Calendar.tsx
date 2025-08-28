'use client';

import { useState, useEffect, useRef } from 'react';
import EventAdd from './modals/EventAdd';
import EventCategoryAdd from './modals/EventCategoryAdd';
import EventEdit from './modals/EventEdit';
import EventCategoryEdit from './modals/EventCategoryEdit';
import { FiEye, FiChevronLeft, FiChevronRight, FiBell } from 'react-icons/fi';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { startOfWeek, parseLocalDate, addDays, formatWeekRange } from '@/lib/calendarHelper';

type calendarData = {
    event_categories: event_category[];
    events: event[];
    tasks: task[];
    tags: tag[];
};

export default function Calendar({ calendarData, startWeekPreference, modalOpen, setModalOpen }: {
    calendarData: calendarData,
    startWeekPreference: number,
    modalOpen: string | null,
    setModalOpen: (value: string | null) => void
}) {
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), startWeekPreference));
    const [jumpDate, setJumpDate] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedCategoryRaw, setSelectedCategoryRaw] = useState<event_category | null>(null);
    const [selectedEventRaw, setSelectedEventRaw] = useState<event | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);
    const [nowTop, setNowTop] = useState<number | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

    const goPrev = () => setWeekStart(addDays(weekStart, -7));
    const goNext = () => setWeekStart(addDays(weekStart, 7));
    const goToday = () => setWeekStart(startOfWeek(new Date(), startWeekPreference));
    
    const closeAll = () => {
        setModalOpen(null);
        setSelectedCategoryRaw(null);
        setSelectedEventRaw(null);
        setModalError(null);
    }

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setJumpDate('');
            }
        };

        const onKeydown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setJumpDate('');
                inputRef.current?.blur();
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
                                <FaRegCalendarAlt className="w-4 h-4"/>
                            </button>
                            <input
                                ref={inputRef}
                                type="date"
                                name="due_date"
                                className="sr-only"
                                style={{
                                    WebkitAppearance: "none",
                                    MozAppearance: "textfield"
                                }}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setJumpDate(val);
                                    if (val) {
                                        const d = parseLocalDate(val);
                                        if (!isNaN(d.getTime())) {
                                            setWeekStart(startOfWeek(d, startWeekPreference));
                                        }
                                    }
                                }}
                            />
                        </div>
                        
                        <button
                            type="button"
                            className="transition inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 bg-white/70 dark:bg-black/20 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:cursor-pointer"
                        >
                            <FiEye className="w-4 h-4"/>
                        </button>

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
                    
                    {/* Tasks & day header */}
                    <div className="grid grid-cols-[64px_repeat(7,1fr)] py-[.3rem] border-b border-r bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                        <div className="h-8" />
                        {Array.from({ length: 7 }).map((_, i) => {
                            const day = addDays(weekStart, i);
                            const isToday =
                                day.getFullYear() === new Date().getFullYear() &&
                                day.getMonth() === new Date().getMonth() &&
                                day.getDate() === new Date().getDate();

                            const weekday = new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(day);
                            const dateNum = day.getDate();
                            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                            const tasksDueToday = calendarData.tasks.filter((task) => {
                                if (!task.due_date) return false;
                                const due = new Date(task.due_date);
                                return (
                                    due.getFullYear() === day.getFullYear() &&
                                    due.getMonth() === day.getMonth() &&
                                    due.getDate() === day.getDate()
                                );
                            });

                            return (
                                <div
                                    key={`head-${i}`}
                                    className={`flex flex-col items-center justify-end rounded-md relative ${isWeekend ? "opacity-90" : ""}`}
                                >
                                    <div
                                        className={`h-9 min-w-7 px-2 flex items-center justify-center rounded-xl text-xl font-semibold gap-1
                                            ${isToday ? "bg-blue-600 text-white" : "text-zinc-900 dark:text-zinc-100"}`}
                                    >
                                        <span className={`text-sm uppercase tracking-wide mr-1 mt-[.225rem]
                                            ${isToday ? "text-zinc-200" : "text-zinc-500 dark:text-zinc-400"}`}>
                                            {weekday}
                                        </span>
                                        {dateNum}

                                        {tasksDueToday.length > 0 && (
                                            <FiBell className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 transition w-4 h-4 ml-1 cursor-pointer"
                                                onMouseEnter={() => setHoveredDayIndex(i)}
                                                onMouseLeave={() => setHoveredDayIndex(null)}
                                                onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {hoveredDayIndex !== null && tooltipPos && (() => {
                        const day = addDays(weekStart, hoveredDayIndex);
                        const tasksDueToday = calendarData.tasks.filter((task) => {
                            if (!task.due_date) return false;
                            const due = new Date(task.due_date);
                            return (
                                due.getFullYear() === day.getFullYear() &&
                                due.getMonth() === day.getMonth() &&
                                due.getDate() === day.getDate()
                            );
                        });

                        return (
                            <div
                                className="fixed z-50 px-2 py-1 text-sm rounded-md bg-white dark:bg-black text-black dark:text-white border-2 border-zinc-500 shadow-lg max-w-xs"
                                style={{
                                    top: tooltipPos.y + 12,
                                    left: "auto",
                                    right: `calc(100vw - ${tooltipPos.x}px)`,
                                    transform: "translateX(-8px)"
                                }}
                            >
                                <ul className="space-y-0.5">
                                    {tasksDueToday.map((task) => {
                                        const tag = task.tag_id
                                            ? calendarData.tags.find((t) => t.id === task.tag_id)
                                            : null;

                                        return (
                                            <li key={task.id} className="truncate flex items-center gap-1">
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
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Calendar cells */}
            <div className="relative grid grid-cols-[64px_repeat(7,1fr)] auto-rows-[48px] overflow-hidden">
                {nowTop !== null && (() => {
                    const today = new Date();
                    const todayIndex = Array.from({ length: 7 }).findIndex((_, i) => {
                        const d = addDays(weekStart, i);
                        return (
                            d.getFullYear() === today.getFullYear() &&
                            d.getMonth() === today.getMonth() &&
                            d.getDate() === today.getDate()
                        );
                    });

                    if (todayIndex === -1) return null;

                    return (
                        <div
                            className="absolute h-0.5 bg-zinc-700 dark:bg-zinc-300 z-20"
                            style={{
                                top: `${nowTop}px`,
                                left: `calc(64px + (100% - 64px) / 7 * ${todayIndex})`,
                                width: `calc((100% - 64px) / 7)`
                            }}
                        >
                            <div className="absolute -left-1.25 top-1/2 w-3 h-3 rounded-full bg-zinc-700 dark:bg-zinc-300 -translate-y-1/2" />
                        </div>
                    );
                })()}
                
                {Array.from({ length: 24 }).map((_, hour) => {
                    const hourLabel = new Intl.DateTimeFormat(undefined, { hour: 'numeric' })
                        .format(new Date(2000, 0, 1, hour));

                    return (
                        <div className="contents" key={`row-${hour}`}>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start justify-end pr-2 pt-1 select-none">
                                {hourLabel}
                            </div>

                            {Array.from({ length: 7 }).map((__, i) => (
                                <div
                                    key={`cell-${hour}-${i}`}
                                    className={`border-l border-zinc-200 dark:border-zinc-800
                                        ${i === 6 ? "border-r" : ""}
                                        ${hour !== 0 ? "border-t border-zinc-200 dark:border-zinc-800" : ""}
                                        ${hour !== 23 ? "border-b border-zinc-200 dark:border-zinc-800" : ""}
                                    `}
                                />
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            {/* {modalOpen === "taskCategoryAdd" && (
                <EventCategoryAdd
                    onClose={closeAll}
                    onSubmit={handleCategoryAdd}
                    modalError={modalError}
                />
            )}
            {modalOpen === "taskAdd" && (
                <EventAdd
                    categories={categories}
                    tags={tags}
                    onClose={closeAll}
                    onSubmit={handleTaskAdd}
                    modalError={modalError}
                    preSelectedCategory={selectedCategory}
                />
            )}

            {modalOpen === "taskCategoryEdit" && selectedCategoryRaw && (
                <CategoryEdit 
                    tags={tags}
                    modalError={modalError}
                    onClose={closeAll}
                    onSubmit={handleCategoryEdit}
                    onDelete={handleCategoryDelete}
                    preSelectedCategory={selectedCategoryRaw}
                    onTagAdd={() => setModalOpen("tagAdd noFade")}
                    onTagEdit={(tagId) => {
                        const tag = tags.find((t: any) => t.id === tagId);
                        if (tag) setSelectedTagRaw(tag);
                        setModalOpen("tagEdit");
                    }}
                    noFade={modalOpen.includes("noFade")}
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
            )} */}
        </div>
    );
}
