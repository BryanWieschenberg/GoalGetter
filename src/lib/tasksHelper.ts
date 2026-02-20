export function formatPgDate(dateStr: string) {
    const [, m, d] = dateStr.split("-").map(Number);
    return `${m}/${d}`;
}

export function daysUntil(dateStr?: string | null) {
    if (!dateStr || dateStr.length < 10) {
        return null;
    }

    const [y, m, d] = dateStr.substring(0, 10).split("-").map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) {
        return null;
    }

    const now = new Date();
    const todayLocalUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const dueLocalUTC = Date.UTC(y, m - 1, d);
    const diff = dueLocalUTC - todayLocalUTC;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function dueColor(days: number | null): string {
    if (days === null) {
        return "text-zinc-400";
    } else if (days <= 1) {
        return "text-red-600";
    } else if (days >= 2 && days <= 4) {
        return "text-orange-500";
    } else if (days >= 5 && days <= 7) {
        return "text-yellow-500";
    } else if (days >= 8 && days <= 14) {
        return "text-green-500";
    } else if (days >= 15 && days <= 30) {
        return "text-sky-400";
    } else {
        return "text-white";
    }
}

export function getPriorityClasses(priority: string | null) {
    switch (priority) {
        case "low":
            return "text-zinc-400 hover:bg-zinc-300 dark:text-zinc-600 dark:hover:bg-zinc-700";
        case "high":
            return "text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-400";
        case "urgent":
            return "text-red-400 hover:bg-red-300 dark:text-red-600 dark:hover:bg-red-700";
        default:
            return "text-zinc-800 hover:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-300";
    }
}
