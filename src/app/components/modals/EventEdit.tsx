"use client";

import { useEffect, useRef, useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";

type EventEditProps = {
    categories: any[];
    modalError?: string | null;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onDelete: (id: number) => void;
    preSelectedEvent: event;
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

function toLocalInput(dt: Date | string | null): string {
    if (!dt) return "";
    const d = typeof dt === "string" ? new Date(dt) : dt;
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function EventEdit({ categories, modalError, onClose, onSubmit, onDelete, preSelectedEvent }: EventEditProps) {
    const rec = preSelectedEvent.recurrence ?? null;
    const [title, setTitle] = useState<string>(preSelectedEvent.title);
    const [description, setDescription] = useState<string>(preSelectedEvent.description ?? "");
    const [selectedCategory, setSelectedCategory] = useState<string>(String(preSelectedEvent.category_id));
    const startDefault = toLocalInput(preSelectedEvent.start_time ?? null);
    const endDefault = toLocalInput(preSelectedEvent.end_time ?? null);
    const [startTime, setStartTime] = useState<string>(startDefault);
    const [endTime, setEndTime] = useState<string>(endDefault);
    const [useCustomColor, setUseCustomColor] = useState<boolean>(!!preSelectedEvent.color);
    const [color, setColor] = useState<string>(preSelectedEvent.color ? `#${preSelectedEvent.color.replace(/^#/, "")}` : "#ffffff");
    const [frequency, setFrequency] = useState<Frequency>((rec?.frequency as Frequency) ?? "");
    const [interval, setInterval] = useState<number>(rec?.interval ?? 1);
    const [count, setCount] = useState<string>(rec?.count != null ? String(rec.count) : "");
    const [until, setUntil] = useState<string>(rec?.until ?? "");
    const [weekly, setWeekly] = useState<string[]>(Array.isArray(rec?.weekly) ? rec!.weekly! : []);
    const [exceptionsCsv, setExceptionsCsv] = useState<string>(Array.isArray(rec?.exceptions) ? rec!.exceptions!.map((ex) => ex.split("T")[0]).join(", ") : "");

    const startRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLInputElement>(null);
    const untilRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!startTime) return;
        if (frequency === "weekly" && weekly.length === 0) {
            const d = new Date(startTime);
            const code = DOW_LABELS[d.getDay()].code;
            setWeekly([code]);
        }
    }, [frequency, startTime, weekly.length]);

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
                                ref={untilRef}
                                type="date"
                                name="until"
                                value={until}
                                onChange={(e) => setUntil(e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 [appearance:none]"
                            />
                            <FaRegCalendarAlt
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 cursor-pointer"
                                size={18}
                                onClick={() => {
                                    if (untilRef.current) {
                                        const anyInput = untilRef.current as any;
                                        if (typeof anyInput.showPicker === "function") {
                                            anyInput.showPicker();
                                        } else {
                                            untilRef.current.focus();
                                        }
                                    }
                                }}
                            />
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
                                        className={`px-3 py-1 rounded-full border text-sm transition ${
                                            active
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                                        }`}
                                    >
                                        {d.label}
                                    </button>
                                );
                            })}
                        </div>
                        <input type="hidden" name="weekly[]" value={JSON.stringify(weekly)} />
                    </div>
                )}

                <div className="grid gap-2">
                    <label className="text-sm font-medium">Exception Dates</label>
                    <input
                        type="text"
                        name="exceptions_csv"
                        value={exceptionsCsv}
                        onChange={(e) => setExceptionsCsv(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                        placeholder="YYYY-MM-DD, YYYY-MM-DD, ..."
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Comma-separated (YYYY-MM-DD). These dates will be skipped.
                    </p>
                    <input
                        type="hidden"
                        name="exceptions"
                        value={JSON.stringify(
                            exceptionsCsv
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                        )}
                    />
                </div>
            </div>
        );
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center animate-fadeIn"
            aria-modal="true"
            role="dialog"
            aria-labelledby="edit-event-title"
        >
            <div className="absolute inset-0 bg-black/50 animate-fadeIn" onClick={onClose} />

            <div className="relative z-[61] w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border-[.2rem] border-zinc-500/70 bg-zinc-100 dark:bg-zinc-900 shadow-2xl animate-slideUp">
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 id="edit-event-title" className="text-lg font-semibold">
                        Edit Event
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
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                        />
                    </div>

                    {/* Description */}
                    <div className="grid gap-3">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                            rows={3}
                            placeholder="Additional details…"
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
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2"
                            >
                                <option value="" disabled hidden>
                                    Select category
                                </option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="useCustomColor"
                                    checked={useCustomColor}
                                    onChange={(e) => setUseCustomColor(e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <span className="text-sm">Custom color?</span>
                                <input
                                    type="color"
                                    id="eventColor"
                                    name="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className={`h-10 w-14 rounded-md border-2 ${
                                        useCustomColor ? "opacity-100" : "opacity-0"
                                    }`}
                                    disabled={!useCustomColor}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Start / End */}
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Start *</label>
                            <input
                                ref={startRef}
                                type="datetime-local"
                                name="start_time"
                                required
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">End *</label>
                            <input
                                ref={endRef}
                                type="datetime-local"
                                name="end_time"
                                required
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Recurrence */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Repeating</label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value as Frequency)}
                            className="w-full rounded-lg border px-3 py-2"
                        >
                            <option value="">Does not repeat</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>

                        {renderRecurrenceFields()}
                    </div>

                    {/* Color hex hidden */}
                    <input
                        type="hidden"
                        name="color_hex"
                        value={useCustomColor ? color.replace(/^#/, "") : ""}
                    />

                    <div className="mt-2 flex items-center justify-between gap-2 border-t pt-4">
                        <button
                            type="button"
                            onClick={() => onDelete(preSelectedEvent.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded"
                        >
                            Delete
                        </button>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded border"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded bg-zinc-900 text-white"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
