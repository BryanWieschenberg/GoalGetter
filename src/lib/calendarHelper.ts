export function startOfWeek(d: Date, weekStart: number = 0) {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);

    const day = date.getDay();
    const diff = (day - weekStart + 7) % 7;
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

const PX_PER_MIN = 48 / 60; // 48px row height
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

export function toDate(d: string | Date): Date {
    return d instanceof Date ? d : new Date(d);
}

export function sameYMD(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
}

export function isLastDayOfMonth(d: Date): boolean {
    const nd = new Date(d);
    nd.setDate(d.getDate() + 1);
    return nd.getDate() === 1;
}

export function minutesSinceMidnight(d: Date): number {
    return d.getHours() * 60 + d.getMinutes();
}

export function clampToWeek(date: Date, weekStart: Date, weekEnd: Date): boolean {
    // Normalize all dates to midnight for comparison
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedWeekStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
    const normalizedWeekEnd = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());
    
    return normalizedDate >= normalizedWeekStart && normalizedDate <= normalizedWeekEnd;
}

export function dayIndexFrom(date: Date, weekStart: Date): number {
    // Create date objects with normalized time (midnight) to avoid time zone issues
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedWeekStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
    
    const ms = normalizedDate.getTime() - normalizedWeekStart.getTime();
    const dayIndex = Math.round(ms / (24 * 60 * 60 * 1000)); // Use Math.round instead of Math.floor
    
    return dayIndex;
}

/** Expand a single event into all visible occurrences for the given week */
export function expandEventForWeek(ev: event, weekStart: Date, weekEnd: Date): EventOccurrence[] {
    const startBase = toDate(ev.start_time);
    const endBase = toDate(ev.end_time);
    const rec = (ev as any).recurrence as any | null;

    // Helper to make an occurrence on a specific target date (copies the time from base)
    const makeOcc = (target: Date): EventOccurrence => {
        const s = new Date(target);
        s.setHours(startBase.getHours(), startBase.getMinutes(), 0, 0);

        const e = new Date(target);
        let endHours = endBase.getHours();
        let endMins = endBase.getMinutes();
        e.setHours(endHours, endMins, 0, 0);

        // handle events that cross midnight (simple +1 day)
        if (e <= s) e.setDate(e.getDate() + 1);

        const top = minutesSinceMidnight(s) * PX_PER_MIN;
        const height = Math.max(22, (e.getTime() - s.getTime()) / (60 * 1000) * PX_PER_MIN);
        const dayIndex = dayIndexFrom(s, weekStart);

        return {
            id: ev.id,
            title: ev.title,
            color: ev.color,
            start: s,
            end: e,
            dayIndex,
            top,
            height
        };
    };

    // No recurrence -> show if it overlaps this week
    if (!rec || !rec.frequency) {
        // Create a more robust overlap check
        // Extend weekEnd to include the full last day (23:59:59)
        const weekEndFull = new Date(weekEnd);
        weekEndFull.setHours(23, 59, 59, 999);
        
        // Extend weekStart to start of day (00:00:00)
        const weekStartFull = new Date(weekStart);
        weekStartFull.setHours(0, 0, 0, 0);
        
        // Check if event overlaps with the week at all
        const overlaps = startBase <= weekEndFull && endBase >= weekStartFull;
                
        if (!overlaps) {
            return [];
        }
        
        const occ = makeOcc(startBase);
                
        // More robust validation for single events
        const eventDate = new Date(startBase.getFullYear(), startBase.getMonth(), startBase.getDate());
        const weekStartDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        const weekEndDate = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());
        
        const withinWeekDates = eventDate >= weekStartDate && eventDate <= weekEndDate;
        const validDayIndex = occ.dayIndex >= 0 && occ.dayIndex <= 6;
                
        if (withinWeekDates && validDayIndex) {
            return [occ];
        }
        
        return [];
    }

    // Common limits
    const until: Date | null = rec.until ? toDate(rec.until) : null;
    const countLimit: number | null = typeof rec.count === 'number' ? rec.count : null;
    const exceptions: Date[] = Array.isArray(rec.exceptions)
        ? rec.exceptions.map((x: string) => toDate(x))
        : [];

    const occurrences: EventOccurrence[] = [];
    const pushIfValid = (d: Date) => {
        if (until && d > until) return;
        if (exceptions.some(ex => sameYMD(ex, d))) return;
        const occ = makeOcc(d);
        
        // More robust validation - check if the event date is within the week bounds
        const withinWeek = clampToWeek(d, weekStart, weekEnd);
        const validDayIndex = occ.dayIndex >= 0 && occ.dayIndex <= 6;
        
        if (withinWeek || validDayIndex) {
            // Additional safety check - ensure dayIndex is within bounds even if date is valid
            if (occ.dayIndex < 0) occ.dayIndex = 0;
            if (occ.dayIndex > 6) occ.dayIndex = 6;
            
            occurrences.push(occ);
        }
    };

    // WEEKLY - This is likely where your "morning runs" issue occurs
    if (rec.frequency === 'weekly') {
        const stepWeeks = Math.max(1, rec.interval || 1);
        const allowedDows: number[] = Array.isArray(rec.weekly) ? rec.weekly.map((x: string) => dowCodeToJs[x]) : [startBase.getDay()];

        // compute "weeks since start" for any date
        const weekStartOf = (d: Date) => {
            const w = new Date(d);
            w.setHours(0,0,0,0);
            // align using weekStartPreference, not always Sunday
            const diff = (w.getDay() - weekStart.getDay() + 7) % 7;
            w.setDate(w.getDate() - diff);
            return w;
        };
        const startWeek0 = weekStartOf(startBase).getTime();

        // Expand the search to include one day before and after the week to catch boundary cases
        const searchStart = new Date(weekStart);
        searchStart.setDate(searchStart.getDate() - 1);
        const searchEnd = new Date(weekEnd);
        searchEnd.setDate(searchEnd.getDate() + 1);

        // iterate each day of expanded search range
        for (let i = -1; i <= 7; i++) { // Expanded range
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);

            if (!allowedDows.includes(d.getDay())) continue;

            const weeksSince = Math.floor((weekStartOf(d).getTime() - startWeek0) / (7*24*3600*1000));
            if (weeksSince < 0 || (weeksSince % stepWeeks) !== 0) continue;

            const startDateOnly = new Date(startBase.getFullYear(), startBase.getMonth(), startBase.getDate());

            if (d < startDateOnly) continue; // don't produce before actual start

            pushIfValid(d);
            if (countLimit && occurrences.length >= countLimit) break;
        }
        return occurrences;
    }

    // DAILY
    if (rec.frequency === 'daily') {
        const step = Math.max(1, rec.interval || 1);
        // Start from a day before weekStart to catch boundary cases
        const d = new Date(Math.max(startBase.getTime(), weekStart.getTime() - 24*60*60*1000));
        // align to interval from startBase
        const diffDaysFromStart = Math.floor((d.getTime() - new Date(startBase.getFullYear(), startBase.getMonth(), startBase.getDate()).getTime()) / (24*3600*1000));
        const offset = (step - (diffDaysFromStart % step)) % step;
        d.setDate(d.getDate() + offset);

        // Extend search to one day after weekEnd
        const searchEnd = new Date(weekEnd);
        searchEnd.setDate(searchEnd.getDate() + 1);

        while (d <= searchEnd) {
            pushIfValid(new Date(d));
            if (countLimit && occurrences.length >= countLimit) break;
            d.setDate(d.getDate() + step);
        }
        return occurrences;
    }

    // MONTHLY - Similar boundary expansion
    if (rec.frequency === 'monthly') {
        const stepMonths = Math.max(1, rec.interval || 1);
        const monthlyDays: number[] | null = Array.isArray(rec.monthly_days) ? rec.monthly_days : null;

        // Expand search range by one day on each side
        for (let i = -1; i <= 7; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);

            // month difference from start
            const monthsSince = (d.getFullYear() - startBase.getFullYear()) * 12 + (d.getMonth() - startBase.getMonth());
            if (monthsSince < 0 || monthsSince % stepMonths !== 0) continue;
            if (d < startBase) continue;

            // day rule
            let match = false;
            if (monthlyDays && monthlyDays.length) {
                for (const md of monthlyDays) {
                    if (md > 0 && d.getDate() === md) match = true;
                    if (md < 0) {
                        // negative from end: -1 = last day, -2 = second last, etc.
                        const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
                        if (d.getDate() === last + md + 1) match = true;
                    }
                }
            } else {
                // default: same DOM as startBase
                match = d.getDate() === startBase.getDate();
            }
            if (!match) continue;

            pushIfValid(d);
            if (countLimit && occurrences.length >= countLimit) break;
        }
        return occurrences;
    }

    // YEARLY - Similar boundary expansion
    if (rec.frequency === 'yearly') {
        const stepYears = Math.max(1, rec.interval || 1);
        const monthsAllowed: number[] | null = Array.isArray(rec.monthly) ? rec.monthly : null; // [1..12] in DB

        for (let i = -1; i <= 7; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);

            const yearsSince = d.getFullYear() - startBase.getFullYear();
            if (yearsSince < 0 || yearsSince % stepYears !== 0) continue;
            if (d < startBase) continue;

            if (monthsAllowed && !monthsAllowed.includes(d.getMonth() + 1)) continue;

            // default: same day-of-month as start
            if (d.getDate() !== startBase.getDate()) continue;

            pushIfValid(d);
            if (countLimit && occurrences.length >= countLimit) break;
        }
        return occurrences;
    }

    return [];
}
/** Expand all events for current week and compute layout metrics */
// Two options to fix the visual layout:

// OPTION 1: Don't apply column layout to non-overlapping events
// In your rendering component, use full width when __colCount === 1

// OPTION 2: Modify the collision detection to only create columns for truly overlapping events
export function buildWeekOccurrences(events: event[], weekStart: Date): EventOccurrence[] {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const occs = events.flatMap(ev => expandEventForWeek(ev, weekStart, weekEnd));

    // Group by day and handle collisions
    const byDay: Record<number, EventOccurrence[]> = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
    occs.forEach(o => byDay[o.dayIndex]?.push(o));
    
    for (const k of Object.keys(byDay)) {
        const arr = byDay[Number(k)];
        arr.sort((a,b) => a.top - b.top);
        
        // Find groups of actually overlapping events
        const overlapGroups: EventOccurrence[][] = [];
        
        arr.forEach(ev => {
            // Find which group this event belongs to (overlaps with)
            let groupFound = false;
            
            for (const group of overlapGroups) {
                const hasOverlapInGroup = group.some(existingEv => {
                    const evStart = ev.top;
                    const evEnd = ev.top + ev.height;
                    const existingStart = existingEv.top;
                    const existingEnd = existingEv.top + existingEv.height;
                    
                    return evStart < existingEnd && evEnd > existingStart;
                });
                
                if (hasOverlapInGroup) {
                    group.push(ev);
                    groupFound = true;
                    break;
                }
            }
            
            // If no overlapping group found, create a new one
            if (!groupFound) {
                overlapGroups.push([ev]);
            }
        });
        
        // Assign column info only within overlap groups
        overlapGroups.forEach(group => {
            if (group.length === 1) {
                // Single event - use full width
                (group[0] as any).__colIndex = 0;
                (group[0] as any).__colCount = 1;
            } else {
                // Multiple overlapping events - assign columns
                const cols: EventOccurrence[][] = [];
                group.forEach(ev => {
                    let placed = false;
                    
                    for (let colIndex = 0; colIndex < cols.length; colIndex++) {
                        const col = cols[colIndex];
                        const hasOverlap = col.some(existingEv => {
                            const evStart = ev.top;
                            const evEnd = ev.top + ev.height;
                            const existingStart = existingEv.top;
                            const existingEnd = existingEv.top + existingEv.height;
                            
                            return evStart < existingEnd && evEnd > existingStart;
                        });
                        
                        if (!hasOverlap) {
                            col.push(ev);
                            placed = true;
                            break;
                        }
                    }
                    
                    if (!placed) {
                        cols.push([ev]);
                    }
                    
                    const colIndex = cols.findIndex(col => col.includes(ev));
                    (ev as any).__colIndex = colIndex;
                    (ev as any).__colCount = cols.length;
                });
            }
        });
    }
    
    return occs;
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
