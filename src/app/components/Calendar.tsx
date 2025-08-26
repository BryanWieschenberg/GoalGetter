'use client';

import { useMemo, useState } from 'react';
import { startOfWeek, addDays, key, weekdayShort, formatHour, isSameDate, formatRange, segmentForDay,
         splitEventByDay, startOfDay, minutesIntoDay, timeRange, chooseTextColor } from '@/lib/calendarHelper';

type calendarData = {
    event_categories: event_category[];
    events: event[];
    tasks: task[];
};

export default function Calendar({ calendarData, startWeekPreference }: { calendarData: calendarData, startWeekPreference: number }) {
    console.log(calendarData)
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), startWeekPreference));

    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [weekStart]);

    const eventsByDay = useMemo(() => {
        const map: Record<string, Array<ReturnType<typeof segmentForDay>>> = {};
        for (const day of weekDays) {
            map[key(day)] = [];
        }
        for (const ev of (calendarData?.events ?? [])) {
            const segs = splitEventByDay(ev, weekStart, addDays(weekStart, 7));
            for (const seg of segs) {
                const k = key(seg.day);
                if (map[k]) map[k].push(seg);
            }
        }
        for (const k of Object.keys(map)) {
            map[k].sort((a, b) => a.startMinutes - b.startMinutes);
        }
        return map;
    }, [calendarData?.events, weekDays, weekStart]);

    const goPrev = () => setWeekStart(addDays(weekStart, -7));
    const goNext = () => setWeekStart(addDays(weekStart, 7));
    const goToday = () => setWeekStart(startOfWeek(new Date()));

    const hourRowHeight = 48;
    const dayColHeight = hourRowHeight * 24;

    return (
        <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={goPrev} className="px-3 py-1.5 rounded border hover:bg-zinc-100 dark:hover:bg-zinc-800">←</button>
                    <button onClick={goToday} className="px-3 py-1.5 rounded border hover:bg-zinc-100 dark:hover:bg-zinc-800">Today</button>
                    <button onClick={goNext} className="px-3 py-1.5 rounded border hover:bg-zinc-100 dark:hover:bg-zinc-800">→</button>
                </div>
                <h1 className="text-xl font-semibold">
                    {formatRange(weekDays[0], weekDays[6])}
                </h1>
                <div />
            </div>

            <div className="grid" style={{ gridTemplateColumns: `64px repeat(7, 1fr)` }}>
                <div />
                {weekDays.map((d) => (
                    <div key={key(d)} className="px-2 pb-2 text-center font-medium">
                        <div className="text-sm text-zinc-500">{weekdayShort(d)}</div>
                        <div className={`text-lg ${isSameDate(d, new Date()) ? 'font-bold' : ''}`}>
                            {d.getMonth() + 1}/{d.getDate()}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid border-t border-zinc-200 dark:border-zinc-800" style={{ gridTemplateColumns: `64px repeat(7, 1fr)` }}>
                <div className="relative">
                    {hours.map((h) => (
                        <div key={h} className="h-12 border-b border-zinc-100 dark:border-zinc-900 pr-2 text-right text-xs text-zinc-500">
                            <div className="translate-y-[-0.5rem]">{formatHour(h)}</div>
                        </div>
                    ))}
                </div>

                {weekDays.map((d) => (
                    <div key={key(d)} className="relative border-l border-zinc-100 dark:border-zinc-900">
                        {hours.map((h) => (
                            <div key={h} className="h-12 border-b border-zinc-100 dark:border-zinc-900" />
                        ))}

                        <div className="absolute inset-0 px-1">
                            {(eventsByDay[key(d)] ?? []).map((seg, idx) => {
                                const top = (seg.startMinutes / (24 * 60)) * dayColHeight;
                                const height = Math.max(22, (seg.durationMinutes / (24 * 60)) * dayColHeight);
                                const bg = seg.color ? `#${seg.color}` : undefined;
                                const textColor = chooseTextColor(bg);
                                return (
                                    <div
                                        key={`${seg.event.id}-${idx}`}
                                        className="absolute left-1 right-1 rounded-md shadow-sm overflow-hidden"
                                        style={{
                                            top,
                                            height,
                                            backgroundColor: bg ?? 'var(--tw-prose-bg, #3b82f6)'
                                        }}
                                        title={`${timeRange(seg.startDate, seg.endDate)} • ${seg.event.title}`}
                                    >
                                        <div className="p-1.5 text-xs" style={{ color: textColor }}>
                                            <div className="font-semibold truncate">{seg.event.title}</div>
                                            <div className="opacity-80">{timeRange(seg.startDate, seg.endDate)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
