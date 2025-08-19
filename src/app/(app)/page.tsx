"use client";

import { useRef, useState, useEffect } from "react";
import Tasks from "../components/Tasks";
import Calendar from "../components/Calendar";

export default function Home() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dragging = useRef(false);
    const [leftPct, setLeftPct] = useState(30);

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
            setLeftPct(clamp(pct, 20, 80));
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

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stop);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", stop);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="flex h-screen w-full overflow-hidden"
        >
            <div
                className="h-full overflow-auto"
                style={{ flex: `0 0 ${leftPct}%` }}
            >
                <Tasks />
            </div>

            <div
                onMouseDown={startDrag}
                onTouchStart={startDrag}
                className="w-[.25rem] cursor-col-resize bg-zinc-300 dark:bg-zinc-700"
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize panels"
            />

            <div className="flex-1 h-full overflow-auto">
                <Calendar />
            </div>
        </div>
    );
}
