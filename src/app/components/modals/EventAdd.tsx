"use client";

import { useEffect, useRef, useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";

type EventAddProps = {
    categories: any[];
    modalError?: string | null;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    preSelectedCategory: event_category | null;
    timeslot: { start: Date; end: Date } | null;
};

type Frequency = "" | "daily" | "weekly" | "monthly" | "yearly";

const DOW_LABELS: { code: string; label: string }[] = [
    { code: "SU", label: "Sun" },
    { code: "MO", label: "Mon" },
    { code: "TU", label: "Tue" },
    { code: "WE", label: "Wed" },
    { code: "TH", label: "Thu" },
    { code: "FR", label: "Fri" },
    { code: "SA", label: "Sat" }
];

const MONTH_OPTIONS = [
    { v: 1, n: "Jan" }, { v: 2, n: "Feb" }, { v: 3, n: "Mar" }, { v: 4, n: "Apr" },
    { v: 5, n: "May" }, { v: 6, n: "Jun" }, { v: 7, n: "Jul" }, { v: 8, n: "Aug" },
    { v: 9, n: "Sep" }, { v: 10, n: "Oct" }, { v: 11, n: "Nov" }, { v: 12, n: "Dec" }
];

function toLocalInput(dt: Date | null): string {
    if (!dt) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = dt.getFullYear();
    const mm = pad(dt.getMonth() + 1);
    const dd = pad(dt.getDate());
    const hh = pad(dt.getHours());
    const mi = pad(dt.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function EventAdd({ categories, modalError, onClose, onSubmit, preSelectedCategory, timeslot }: EventAddProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>(preSelectedCategory ? String(preSelectedCategory.id) : "");
    const [frequency, setFrequency] = useState<Frequency>("");
    const [weekly, setWeekly] = useState<string[]>([]);
    const [interval, setInterval] = useState<number>(1);
    const [count, setCount] = useState<string>(""); // optional
    const [until, setUntil] = useState<string>(""); // date or datetime (we’ll use date)
    const [exceptions, setExceptions] = useState<string>(""); // comma-separated dates (YYYY-MM-DD)
    const [useCustomColor, setUseCustomColor] = useState(false);
    const startRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLInputElement>(null);

    const startDefault = toLocalInput(timeslot?.start ?? null);
    const endDefault = toLocalInput(timeslot?.end ?? null);

    const [startTime, setStartTime] = useState<string>(startDefault || "");

    useEffect(() => {
        if (!startTime) return;

        if (frequency === "weekly") {
            const d = new Date(startTime);
            const code = DOW_LABELS[d.getDay()].code;
            setWeekly([code]);
        }
    }, [frequency, startTime]);

    const renderRecurrenceFields = () => {
        if (!frequency) return null;

        return (
            <div className="space-y-3 rounded-lg border border-zinc-300 dark:border-zinc-700 p-3">
                <div className="grid gap-2 sm:grid-cols-3">
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Every</label>
                        <input
                            type="number"
                            min={1}
                            name="interval"
                            value={interval}
                            onChange={(e) => setInterval(Math.max(1, Number(e.target.value || 1)))}
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                        />
                        <input type="hidden" name="frequency" value={frequency} />
                    </div>

                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Total Occurrences</label>
                        <input
                            type="number"
                            name="count"
                            value={count}
                            onChange={(e) => setCount(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                            placeholder="e.g., 10"
                        />
                    </div>

                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Until</label>
                        <div className="relative w-full">
                            <input
                                type="date"
                                name="until"
                                value={until}
                                onChange={(e) => setUntil(e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 [appearence:none]"
                                style={{
                                    WebkitAppearance: "none",
                                    MozAppearance: "textfield"
                                }}
                            />
                            <FaRegCalendarAlt
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 cursor-pointer"
                                size={18}
                                onClick={() => {
                                    const input = document.querySelector<HTMLInputElement>('input[name="until"]');
                                    if (input) {
                                        if (typeof (input as any).showPicker === "function") {
                                            (input as any).showPicker();
                                        } else {
                                            input.focus();
                                        }
                                    }
                                }}
                            />

                            <style jsx>{`
                                input[type="date"]::-webkit-calendar-picker-indicator,
                                input[type="datetime-local"]::-webkit-calendar-picker-indicator {
                                    opacity: 0;
                                    display: none;
                                    -webkit-appearance: none;
                                }
                                input[type="date"]::-webkit-clear-button,
                                input[type="datetime-local"]::-webkit-clear-button {
                                    display: none;
                                }
                                input[type="date"]::-moz-calendar-picker-indicator,
                                input[type="datetime-local"]::-moz-calendar-picker-indicator {
                                    display: none;
                                }
                            `}</style>
                        </div>
                    </div>
                </div>

                {frequency === "weekly" && (
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Repeat on</label>
                        <div className="flex flex-wrap gap-1 overflow-x-hidden">
                            {DOW_LABELS.map((d) => {
                                const active = weekly.includes(d.code);
                                return (
                                    <button
                                        type="button"
                                        key={d.code}
                                        onClick={() => {
                                            setWeekly((prev) =>
                                                prev.includes(d.code)
                                                    ? prev.filter((x) => x !== d.code)
                                                    : [...prev, d.code]
                                            );
                                        }}
                                        className={`px-3 py-1 rounded-full border text-sm transition hover:cursor-pointer ${
                                            active
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 hover:dark:bg-zinc-800"
                                        }`}
                                    >
                                        {d.label}
                                    </button>
                                );
                            })}
                        </div>

                        {weekly.map((w, i) => (
                            <input key={w + i} type="hidden" name="weekly[]" value={w} />
                        ))}
                    </div>
                )}

                <div className="grid gap-2">
                    <label className="text-sm font-medium">Exception Dates</label>
                    <input
                        type="text"
                        name="exceptions"
                        value={exceptions}
                        onChange={(e) => setExceptions(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 
                                px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                        placeholder="YYYY-MM-DD, YYYY-MM-DD, ..."
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Comma-separated (YYYY-MM-DD). These dates will be skipped.
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center animate-fadeIn"
            aria-modal="true"
            role="dialog"
            aria-labelledby="new-event-title"
        >
            <div
                className="absolute inset-0 bg-black/50 animate-fadeIn"
                onClick={onClose}
            />

            <div className="relative z-[61] w-full max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden
               rounded-2xl border-[.2rem] border-zinc-500/70 
               bg-zinc-100 dark:bg-zinc-900 shadow-2xl animate-slideUp">
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 id="new-event-title" className="text-lg font-semibold">
                        Create Event
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {modalError && (
                    <div className="px-5 py-3 bg-red-300 text-black dark:bg-red-800 dark:text-white">
                        <strong>Error: </strong>{modalError}
                    </div>
                )}

                <form className="px-5 py-4 space-y-4" onSubmit={onSubmit}>
                    {/* Title */}
                    <div className="grid gap-3">
                        <label className="text-sm font-medium">Title *</label>
                        <input
                            required
                            type="text"
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                            placeholder="Event name..."
                            name="title"
                        />
                    </div>

                    {/* Description */}
                    <div className="grid gap-3">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                            placeholder="Additional details…"
                            rows={3}
                            name="description"
                        />
                    </div>

                    {/* Category & Color */}
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Category *</label>
                            <select
                                name="category_id"
                                required
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                            >
                                <option value="" disabled hidden className="text-zinc-400">
                                    Select category
                                </option>
                                {categories.map((c) => (
                                    <option
                                        key={c.id}
                                        value={c.id}
                                        style={{ color: c.color ? `#${c.color}` : undefined }}
                                    >
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Colors exactly like TaskCategoryAdd */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="useCustomColor"
                                    name="useCustomColor"
                                    checked={useCustomColor}
                                    onChange={(e) => setUseCustomColor(e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <span className="text-sm">Custom color?</span>

                                <input
                                    type="color"
                                    id="eventColor"
                                    name="color"
                                    defaultValue="#ffffff"
                                    className={`h-10 w-14 rounded-md border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-1
                                        ${useCustomColor ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-0"}`}
                                    disabled={!useCustomColor}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Start / End */}
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Start *</label>
                            <div className="relative w-full">
                                <input
                                    ref={startRef}
                                    type="datetime-local"
                                    name="start_time"
                                    required
                                    defaultValue={startDefault}
                                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 [appearance:none]"
                                    style={{
                                        WebkitAppearance: "none",
                                        MozAppearance: "textfield"
                                    }}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                                <FaRegCalendarAlt
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 cursor-pointer"
                                    size={18}
                                    onClick={() => {
                                        if (startRef.current) {
                                            if (typeof (startRef.current as any).showPicker === "function") {
                                                (startRef.current as any).showPicker();
                                            } else {
                                                startRef.current.focus();
                                            }
                                        }
                                    }}
                                />

                                <style jsx>{`
                                    input[type="date"]::-webkit-calendar-picker-indicator,
                                    input[type="datetime-local"]::-webkit-calendar-picker-indicator {
                                        opacity: 0;
                                        display: none;
                                        -webkit-appearance: none;
                                    }

                                    /* Hide native clear button (optional) */
                                    input[type="date"]::-webkit-clear-button {
                                        display: none;
                                    }

                                    /* Hide in Firefox */
                                    input[type="date"]::-moz-calendar-picker-indicator {
                                        display: none;
                                    }
                                `}</style>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">End *</label>
                            <div className="relative w-full">
                                <input
                                    ref={endRef}
                                    type="datetime-local"
                                    name="end_time"
                                    required
                                    defaultValue={endDefault}
                                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 [appearance:none]"
                                />
                                <FaRegCalendarAlt
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 cursor-pointer"
                                    size={18}
                                    onClick={() => {
                                        if (endRef.current) {
                                            if (typeof (endRef.current as any).showPicker === "function") {
                                                (endRef.current as any).showPicker();
                                            } else {
                                                endRef.current.focus();
                                            }
                                        }
                                    }}
                                />

                                <style jsx>{`
                                    input[type="date"]::-webkit-calendar-picker-indicator,
                                    input[type="datetime-local"]::-webkit-calendar-picker-indicator {
                                        opacity: 0;
                                        display: none;
                                        -webkit-appearance: none;
                                    }

                                    /* Hide native clear button (optional) */
                                    input[type="date"]::-webkit-clear-button {
                                        display: none;
                                    }

                                    /* Hide in Firefox */
                                    input[type="date"]::-moz-calendar-picker-indicator {
                                        display: none;
                                    }
                                `}</style>
                            </div>
                        </div>
                    </div>

                    {/* Recurrence */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Repeating</label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value as Frequency)}
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                        >
                            <option value="">Does not repeat</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>

                        {/* Conditionally rendered detail controls */}
                        {renderRecurrenceFields()}

                        {/* Hidden mirrors so backend gets arrays/strings even when empty */}
                        {!frequency && <input type="hidden" name="frequency" value="" />}
                        {!frequency && <input type="hidden" name="interval" value="1" />}
                    </div>

                    <input type="hidden" name="exceptions_csv" value={exceptions} />

                    <div className="mt-2 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="hover:cursor-pointer rounded-lg px-4 py-2 text-sm ring-1 ring-inset ring-zinc-300/70 dark:ring-zinc-700/70 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="hover:cursor-pointer rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:opacity-90 active:opacity-80"
                        >
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
