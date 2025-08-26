export function startOfWeek(d: Date, weekStart: number = 0) {
    const date = new Date(d);
    const day = date.getDay(); // 0 Sun - 6 Sat
    const diff = (day < weekStart ? 7 : 0) + day - weekStart;
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - diff);
    return date;
}

export function addDays(d: Date, n: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}

export function key(d: Date) {
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function weekdayShort(d: Date) {
    return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export function formatHour(h: number) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = ((h + 11) % 12) + 1;
    return `${hr} ${ampm}`;
}

export function isSameDate(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatRange(a: Date, b: Date) {
    const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const yearA = a.getFullYear();
    const yearB = b.getFullYear();
    if (sameMonth && yearA === yearB) {
        return `${a.toLocaleDateString(undefined, opts)} – ${b.getDate()}, ${yearA}`;
    }
    return `${a.toLocaleDateString(undefined, opts)} – ${b.toLocaleDateString(undefined, opts)}, ${yearB}`;
}

export function segmentForDay(event: event, day: Date, start: Date, end: Date) {
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

export function splitEventByDay(ev: event, weekStart: Date, weekEnd: Date) {
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

export function startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

export function minutesIntoDay(d: Date) {
    return d.getHours() * 60 + d.getMinutes();
}

export function timeRange(a: Date, b: Date) {
    const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
    return `${a.toLocaleTimeString([], opts)}–${b.toLocaleTimeString([], opts)}`;
}

export function chooseTextColor(bg?: string) {
    if (!bg) return 'white';
    const hex = bg.replace('#', '');
    if (hex.length !== 6) return 'white';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 160 ? '#111111' : '#ffffff';
}
