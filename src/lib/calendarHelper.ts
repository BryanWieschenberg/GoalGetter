export function startOfWeek(d: Date, weekStart: number = 0) {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const diff = (date.getDay() - weekStart + 7) % 7;
    date.setDate(date.getDate() - diff);
    return date;
}

export function parseLocalDate(yyyyMmDd: string) {
    const [y, m, d] = yyyyMmDd.split("-").map(Number);
    return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}

export function formatWeekRange(start: Date, end: Date): string {
    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
    const sameYear = start.getFullYear() === end.getFullYear();

    if (sameMonth) {
        return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(start);
    } else if (sameYear) {
        const firstLabel = new Intl.DateTimeFormat(undefined, { month: 'short' }).format(start);
        const lastLabel  = new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(end);
        return `${firstLabel} – ${lastLabel}`;
    } else {
        const firstLabel = new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(start);
        const lastLabel  = new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(end);
        return `${firstLabel} – ${lastLabel}`;
    }
}

const PX_PER_MIN = 48 / 60;
const dowCodeToJs: Record<string, number> = { MO:1, TU:2, WE:3, TH:4, FR:5, SA:6, SU:0 };

type EventOccurrence = {
    id: number;
    title: string;
    color?: string | null;
    start: Date;
    end: Date;
    dayIndex: number;
    top: number;
    height: number;
};

const toDateOnly = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
const monthsBetween = (a: Date, b: Date) =>
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());

export function toDate(d: string | Date): Date {
    return d instanceof Date ? d : new Date(d);
}

export function sameYMD(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
}

export function minutesSinceMidnight(d: Date): number {
    return d.getHours() * 60 + d.getMinutes();
}

export function clampToWeek(date: Date, weekStart: Date, weekEnd: Date): boolean {
    const d0 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const w0 = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
    const w1 = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());
    return d0 >= w0 && d0 <= w1;
}

export function dayIndexFrom(date: Date, weekStart: Date): number {
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedWeekStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
    const ms = normalizedDate.getTime() - normalizedWeekStart.getTime();
    return Math.round(ms / (24 * 60 * 60 * 1000));
}

export function getContrastTextColor(hex: string): string {
    if (!hex) return "black";
    hex = hex.replace(/^#/, "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "black" : "white";
}

function occurrenceIndex(start: Date, candidate: Date, frequency: string, interval: number): number | null {
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const c = new Date(candidate.getFullYear(), candidate.getMonth(), candidate.getDate());
    if (c < s) return null;

    if (frequency === "daily") {
        const days = Math.floor((c.getTime() - s.getTime()) / (24*3600*1000));
        if (days % interval !== 0) return null;
        return Math.floor(days / interval) + 1;
    }

    if (frequency === "weekly") {
        const weeks = Math.floor((c.getTime() - s.getTime()) / (7*24*3600*1000));
        if (weeks % interval !== 0) return null;
        return Math.floor(weeks / interval) + 1;
    }

    if (frequency === "monthly") {
        const months = (c.getFullYear() - s.getFullYear()) * 12 + (c.getMonth() - s.getMonth());
        if (months % interval !== 0 || c.getDate() !== s.getDate()) return null;
        return Math.floor(months / interval) + 1;
    }

    if (frequency === "yearly") {
        const years = c.getFullYear() - s.getFullYear();
        if (years % interval !== 0 || c.getMonth() !== s.getMonth() || c.getDate() !== s.getDate()) return null;
        return Math.floor(years / interval) + 1;
    }

    return null;
}

export function expandEventForWeek(ev: event, weekStart: Date, weekEnd: Date): EventOccurrence[] {
    const startBase = toDate(ev.start_time);
    const endBase = toDate(ev.end_time);
    const rec = (ev as any).recurrence as any | null;

    const makeOcc = (target: Date): EventOccurrence => {
        const s = new Date(target);
        s.setHours(startBase.getHours(), startBase.getMinutes(), 0, 0);

        const e = new Date(target);
        e.setHours(endBase.getHours(), endBase.getMinutes(), 0, 0);
        if (e <= s) e.setDate(e.getDate() + 1);

        const top = minutesSinceMidnight(s) * PX_PER_MIN;
        const height = Math.max(22, (e.getTime() - s.getTime()) / (60 * 1000) * PX_PER_MIN);
        const dayIndex = dayIndexFrom(s, weekStart);

        return { id: ev.id, title: ev.title, color: ev.color, start: s, end: e, dayIndex, top, height };
    };

    if (!rec || !rec.frequency) {
        const weekEndFull = new Date(weekEnd);
        weekEndFull.setHours(23, 59, 59, 999);
        const weekStartFull = new Date(weekStart);
        weekStartFull.setHours(0, 0, 0, 0);
        const overlaps = startBase <= weekEndFull && endBase >= weekStartFull;
        if (!overlaps) { return []; }
        
        const occ = makeOcc(startBase);
        const eventDate = new Date(startBase.getFullYear(), startBase.getMonth(), startBase.getDate());
        const w0 = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        const w1 = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());
                        
        if (
            eventDate >= w0 &&
            eventDate <= w1 &&
            occ.dayIndex >= 0 &&
            occ.dayIndex <= 6
        ) {
            return [occ];
        }

        return [];
    }

    const until: Date | null = rec.until ? toDate(rec.until) : null;
    const countLimit: number | null = typeof rec.count === 'number' ? rec.count : null;
    const occurrences: EventOccurrence[] = [];
    const exceptions: Date[] = Array.isArray(rec.exceptions)
        ? rec.exceptions.map((x: string) => toDate(x))
        : [];

    const pushIfValid = (d: Date) => {
        if (until && d > until) return;
        if (exceptions.some(ex => sameYMD(ex, d))) return;
        
        const occ = makeOcc(d);
        const withinWeek = clampToWeek(d, weekStart, weekEnd);
        const validDayIndex = occ.dayIndex >= 0 && occ.dayIndex <= 6;
        
        if (withinWeek && validDayIndex) occurrences.push(occ);
    };

    if (rec.frequency === 'daily') {
        const step = Math.max(1, rec.interval || 1);
        const d = new Date(Math.max(startBase.getTime(), weekStart.getTime() - 24*60*60*1000));

        const start0 = new Date(startBase.getFullYear(), startBase.getMonth(), startBase.getDate()).getTime();
        const diffDays = Math.floor((d.getTime() - start0) / (24 * 3600 * 1000));
        const offset = (step - (diffDays % step)) % step;
        d.setDate(d.getDate() + offset);

        const searchEnd = new Date(weekEnd);
        searchEnd.setDate(searchEnd.getDate() + 1);

        while (d <= searchEnd) {
            const idx = occurrenceIndex(startBase, d, rec.frequency, rec.interval || 1);
            if (idx && (!countLimit || idx <= countLimit)) {
                pushIfValid(d);
            }
            d.setDate(d.getDate() + step);
        }
        return occurrences;
    }

    if (rec.frequency === 'weekly') {
        const stepWeeks = Math.max(1, rec.interval || 1);
        const allowedDows: number[] = Array.isArray(rec.weekly)
            ? rec.weekly.map((x: string) => dowCodeToJs[x])
            : [startBase.getDay()];

        const weekStartOf = (d: Date) => {
            const w = new Date(d);
            w.setHours(0,0,0,0);
            const diff = (w.getDay() - weekStart.getDay() + 7) % 7;
            w.setDate(w.getDate() - diff);
            return w;
        };
        const startWeek0 = weekStartOf(startBase).getTime();

        for (let i = -1; i <= 7; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            if (!allowedDows.includes(d.getDay())) continue;

            const weeksSince = Math.floor((weekStartOf(d).getTime() - startWeek0) / (7 * 24 * 3600 * 1000));
            if (weeksSince < 0 || (weeksSince % stepWeeks) !== 0) continue;

            const startDateOnly = new Date(startBase.getFullYear(), startBase.getMonth(), startBase.getDate());
            if (d < startDateOnly) continue;

            const idx = occurrenceIndex(startBase, d, rec.frequency, rec.interval || 1);
            if (idx && (!countLimit || idx <= countLimit)) {
                pushIfValid(d);
            }
        }
        return occurrences;
    }

    if (rec.frequency === 'monthly') {
        const step = Math.max(1, rec.interval || 1);
        const startDateOnly = toDateOnly(startBase);

        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);

            if (toDateOnly(d) < startDateOnly) continue;
            if (d.getDate() !== startBase.getDate()) continue;
            if (monthsBetween(startBase, d) % step !== 0) continue;

            const idx = occurrenceIndex(startBase, d, rec.frequency, rec.interval || 1);
            if (idx && (!countLimit || idx <= countLimit)) {
                pushIfValid(d);
            }
        }
        return occurrences;
    }

    if (rec.frequency === 'yearly') {
        const stepYears = Math.max(1, rec.interval || 1);

        for (let i = -1; i <= 7; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);

            const yearsSince = d.getFullYear() - startBase.getFullYear();
            if (yearsSince < 0 || yearsSince % stepYears !== 0) continue;

            const startDateOnly = toDateOnly(startBase);
            if (toDateOnly(d) < startDateOnly) continue;

            if (
                d.getMonth() !== startBase.getMonth() ||
                d.getDate() !== startBase.getDate()
            ) continue;

            const idx = occurrenceIndex(startBase, d, rec.frequency, rec.interval || 1);
            if (idx && (!countLimit || idx <= countLimit)) {
                pushIfValid(d);
            }
        }
        return occurrences;
    }

    return [];
}

export function buildWeekOccurrences(events: event[], weekStart: Date): EventOccurrence[] {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const occs = events.flatMap(ev => expandEventForWeek(ev, weekStart, weekEnd));

    const byDay: Record<number, EventOccurrence[]> = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
    occs.forEach(o => byDay[o.dayIndex]?.push(o));
    
    for (const k of Object.keys(byDay)) {
        const arr = byDay[Number(k)];
        arr.sort((a, b) => a.top - b.top);
        const groups: EventOccurrence[][] = [];

        arr.forEach((ev) => {
            let placedGroup: EventOccurrence[] | null = null;

            for (const g of groups) {
                const overlaps = g.some((e2) => ev.top < e2.top + e2.height && ev.top + ev.height > e2.top);
                if (overlaps) {
                    placedGroup = g;
                    break;
                }
            }

            if (!placedGroup) {
                groups.push([ev]);
            } else {
                placedGroup.push(ev);
            }
        });

        groups.forEach((group) => {
            if (group.length === 1) {
                (group[0] as any).__colIndex = 0;
                (group[0] as any).__colCount = 1;
                return;
            }

            const cols: EventOccurrence[][] = [];
            group.forEach((ev) => {
                let placed = false;
                for (const col of cols) {
                    const overlaps = col.some((e2) => ev.top < e2.top + e2.height && ev.top + ev.height > e2.top);
                    if (!overlaps) {
                        col.push(ev);
                        placed = true;
                        break;
                    }
                }

                if (!placed) cols.push([ev]);
                const colIndex = cols.findIndex((c) => c.includes(ev));
                (ev as any).__colIndex = colIndex;
                (ev as any).__colCount = cols.length;
            });
        });
    }

    return occs;
}
