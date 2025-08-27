"use client";

import { useRef, useState, useEffect } from "react";
import Tasks from "../components/Tasks";
import Calendar from "../components/Calendar";

export default function HomePage({ body, startWeek }: { body: any, startWeek: any }) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dragging = useRef(false);
    const [leftPct, setLeftPct] = useState(27);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileView, setMobileView] = useState<"tasks" | "calendar">("tasks");
    const [tasks, setTasks] = useState(body.tasks);
    const [modalOpen, setModalOpen] = useState<string | null>(null);

    let startWeekCode = 0;
    switch (startWeek) {
        case 'mon': startWeekCode = 1; break;
        case 'tue': startWeekCode = 2; break;
        case 'wed': startWeekCode = 3; break;
        case 'thu': startWeekCode = 4; break;
        case 'fri': startWeekCode = 5; break;
        case 'sat': startWeekCode = 6; break;
        default: startWeekCode = 0;
    }

    const clamp = (n: number, min: number, max: number) =>
        Math.max(min, Math.min(max, n));

    const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        dragging.current = true;
    };

    useEffect(() => {
        const onMove = (clientX: number) => {
            if (!dragging.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = clamp(clientX - rect.left, 0, rect.width);
            const pct = (x / rect.width) * 100;
            setLeftPct(clamp(pct, 10, 90));
        };

        const handleMouseMove = (e: MouseEvent) => onMove(e.clientX);
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) onMove(e.touches[0].clientX);
        };
        const stop = () => (dragging.current = false);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", stop);
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
        window.addEventListener("touchend", stop);
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stop);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", stop);
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    return (
        <div ref={containerRef} className="flex overflow-hidden h-full relative">
            {isMobile ? (
                <>
                    {mobileView === "tasks" ? (
                        <Tasks
                            taskData={{
                                task_categories: body.task_categories,
                                task_tags: body.task_tags,
                            }}
                            tasks={tasks}
                            setTasks={setTasks}
                            modalOpen={modalOpen}
                            setModalOpen={setModalOpen}
                        />
                    ) : (
                        <Calendar
                            calendarData={{
                                event_categories: body.event_categories,
                                events: body.events,
                                tasks
                            }}
                            startWeekPreference={startWeekCode || 0}
                            modalOpen={modalOpen}
                            setModalOpen={setModalOpen}
                        />
                    )}

                    <button
                        onClick={() =>
                            setMobileView(mobileView === "tasks" ? "calendar" : "tasks")
                        }
                        className="fixed bottom-4 right-4 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-3 shadow-lg hover:opacity-90 active:opacity-80"
                    >
                        ⇆
                    </button>
                </>
            ) : (
                <>
                    <div className="overflow-y-auto" style={{ flex: `0 0 ${leftPct}%` }}>
                        <Tasks
                            taskData={{
                                task_categories: body.task_categories,
                                task_tags: body.task_tags,
                            }}
                            tasks={tasks}
                            setTasks={setTasks}
                            modalOpen={modalOpen}
                            setModalOpen={setModalOpen}
                        />
                    </div>

                    <div
                        onMouseDown={startDrag}
                        onTouchStart={startDrag}
                        className="w-[.25rem] cursor-col-resize bg-zinc-300 dark:bg-zinc-700"
                        role="separator"
                        aria-orientation="vertical"
                        aria-label="Resize panels"
                    />

                    <div className="flex-1 overflow-y-auto">
                        <Calendar
                            calendarData={{
                                event_categories: body.event_categories,
                                events: body.events,
                                tasks
                            }}
                            startWeekPreference={startWeekCode || 0}
                            modalOpen={modalOpen}
                            setModalOpen={setModalOpen}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
