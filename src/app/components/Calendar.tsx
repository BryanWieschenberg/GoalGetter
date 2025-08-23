'use client';

import { useMemo, useState } from 'react';

type EventItem = {
    id: number;
    title: string;
    description?: string | null;
    start_time: string;
    end_time: string;
    color?: string | null;
};

export default function Calendar({ eventData, startWeekPreference }: { eventData: { events: EventItem[] }, startWeekPreference: number }) {
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
        for (const ev of (eventData?.events ?? [])) {
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
    }, [eventData?.events, weekDays, weekStart]);

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

function startOfWeek(d: Date, weekStart: number = 0) {
    const date = new Date(d);
    const day = date.getDay(); // 0 Sun - 6 Sat
    const diff = (day < weekStart ? 7 : 0) + day - weekStart;
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - diff);
    return date;
}

function addDays(d: Date, n: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}

function key(d: Date) {
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function weekdayShort(d: Date) {
    return d.toLocaleDateString(undefined, { weekday: 'short' });
}

function formatHour(h: number) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = ((h + 11) % 12) + 1;
    return `${hr} ${ampm}`;
}

function isSameDate(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatRange(a: Date, b: Date) {
    const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const yearA = a.getFullYear();
    const yearB = b.getFullYear();
    if (sameMonth && yearA === yearB) {
        return `${a.toLocaleDateString(undefined, opts)} – ${b.getDate()}, ${yearA}`;
    }
    return `${a.toLocaleDateString(undefined, opts)} – ${b.toLocaleDateString(undefined, opts)}, ${yearB}`;
}

function segmentForDay(event: EventItem, day: Date, start: Date, end: Date) {
    const color = event.color ?? null;
    const segStart = new Date(Math.max(start.getTime(), day.getTime()));
    const segEnd = new Date(Math.min(end.getTime(), addDays(day, 1).getTime()));
    const startMinutes = minutesIntoDay(segStart);
    const endMinutes = minutesIntoDay(segEnd);
    return {
        event,
        color,
        day,
        startDate: segStart,
        endDate: segEnd,
        startMinutes,
        durationMinutes: Math.max(1, endMinutes - startMinutes)
    };
}

function splitEventByDay(ev: EventItem, weekStart: Date, weekEnd: Date) {
    const s = new Date(ev.start_time);
    const e = new Date(ev.end_time);
    if (e <= weekStart || s >= weekEnd) return [];

    const start = new Date(Math.max(s.getTime(), weekStart.getTime()));
    const end = new Date(Math.min(e.getTime(), weekEnd.getTime()));

    const segments: Array<ReturnType<typeof segmentForDay>> = [];
    let cursor = startOfDay(start);
    while (cursor < end) {
        const dayStart = new Date(Math.max(cursor.getTime(), start.getTime()));
        const dayEnd = new Date(Math.min(addDays(cursor, 1).getTime(), end.getTime()));
        segments.push(segmentForDay(ev, cursor, dayStart, dayEnd));
        cursor = addDays(cursor, 1);
    }
    return segments;
}

function startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function minutesIntoDay(d: Date) {
    return d.getHours() * 60 + d.getMinutes();
}

function timeRange(a: Date, b: Date) {
    const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
    return `${a.toLocaleTimeString([], opts)}–${b.toLocaleTimeString([], opts)}`;
}

function chooseTextColor(bg?: string) {
    if (!bg) return 'white';
    const hex = bg.replace('#', '');
    if (hex.length !== 6) return 'white';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 160 ? '#111111' : '#ffffff';
}
