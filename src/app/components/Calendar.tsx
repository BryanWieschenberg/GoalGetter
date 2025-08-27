'use client';

import { useState, useEffect, useRef } from 'react';
import { startOfWeek, addDays, key, weekdayShort, formatHour, isSameDate, formatRange, segmentForDay,
         splitEventByDay, startOfDay, minutesIntoDay, timeRange, chooseTextColor } from '@/lib/calendarHelper';
import EventAdd from './modals/EventAdd';
import EventCategoryAdd from './modals/EventCategoryAdd';
import EventEdit from './modals/EventEdit';
import EventCategoryEdit from './modals/EventCategoryEdit';
import { FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaRegCalendarAlt } from 'react-icons/fa';

type calendarData = {
    event_categories: event_category[];
    events: event[];
    tasks: task[];
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
    const [location, setLocation] = useState<string | null>(null);
    const [selectedCategoryRaw, setSelectedCategoryRaw] = useState<event_category | null>(null);
    const [selectedEventRaw, setSelectedEventRaw] = useState<event | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);
    const [highlightedBox, setHighlightedBox] = useState<string | null>(null);

    const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(weekStart);

    const goPrev = () => setWeekStart(addDays(weekStart, -7));
    const goNext = () => setWeekStart(addDays(weekStart, 7));
    const goToday = () => setWeekStart(startOfWeek(new Date(), startWeekPreference));
    
    const closeAll = () => {
        setModalOpen(null);
        setSelectedCategoryRaw(null);
        setSelectedEventRaw(null);
        setModalError(null);
        setHighlightedBox(null);
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

        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKeydown);

        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKeydown);
        };
    }, []);

    return (
        <div>
            <div className="border-b-2 border-zinc-300 dark:border-zinc-700 px-3 py-2 mb-1">
                <div className="flex flex-wrap items-center gap-2">
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
                                        inputRef.current.click();
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
                    >
                        Today
                    </button>

                    <div className="flex items-center px-3">
                        <button
                            type="button"
                            className="inline-flex items-center p-1.5 rounded-lg transition hover:rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:cursor-pointer"
                        >
                            <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center p-1.5 rounded-lg transition hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:cursor-pointer"
                        >
                            <FiChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="text-xl font-semibold">
                        August 2025
                    </div>
                </div>
            </div>

            <div className="p-1.5">
                <p>balls</p>
            </div>

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
