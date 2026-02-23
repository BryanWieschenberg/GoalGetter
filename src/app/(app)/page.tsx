import { auth } from "@/lib/authOptions";
import HomePage from "./HomePage";
import WelcomePage from "../components/WelcomePage";
import pool from "@/lib/db";
import { startOfWeek, addDays, parseLocalDate } from "@/lib/calendarHelper";

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await auth();
    let res = null;
    let settings = null;
    let nowTop = 0;

    if (session) {
        const params = await searchParams;
        const dateParam = typeof params.date === "string" ? params.date : undefined;

        settings = await pool.query(`SELECT week_start FROM user_settings WHERE user_id = $1`, [
            session.user.id,
        ]);
        const userSettings = settings.rows[0];

        let weekStartPref = 0;
        if (userSettings?.week_start === "mon") weekStartPref = 1;
        else if (userSettings?.week_start === "tue") weekStartPref = 2;
        else if (userSettings?.week_start === "wed") weekStartPref = 3;
        else if (userSettings?.week_start === "thu") weekStartPref = 4;
        else if (userSettings?.week_start === "fri") weekStartPref = 5;
        else if (userSettings?.week_start === "sat") weekStartPref = 6;

        let activeDate = new Date();
        if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
            const parsed = parseLocalDate(dateParam);
            if (!isNaN(parsed.getTime())) {
                activeDate = parsed;
            }
        }

        const ws = startOfWeek(activeDate, weekStartPref);
        const rangeStart = ws.toISOString().split("T")[0];
        const rangeEnd = addDays(ws, 6).toISOString().split("T")[0];
        const rangeEndInclusive = `${rangeEnd} 23:59:59`;

        res = await pool.query(
            `SELECT json_build_object(
                'task_categories', (
                    SELECT COALESCE(json_agg(c ORDER BY c.sort_order), '[]'::json) 
                    FROM task_categories c 
                    WHERE c.user_id = $1
                ),
                'task_tags', (
                    SELECT COALESCE(json_agg(tg), '[]'::json) 
                    FROM task_tags tg 
                    WHERE tg.category_id IN (
                        SELECT id FROM task_categories WHERE user_id = $1
                    )
                ),
                'tasks', (
                    SELECT COALESCE(json_agg(t ORDER BY t.sort_order), '[]'::json) 
                    FROM (
                        SELECT t.*
                        FROM tasks t
                        WHERE t.category_id IN (
                            SELECT id FROM task_categories WHERE user_id = $1
                        )
                        ORDER BY t.category_id, t.sort_order, t.id
                        LIMIT 51
                    ) t
                ),
                'tasks_has_more', (
                    SELECT COUNT(*) > 50
                    FROM tasks t
                    WHERE t.category_id IN (
                        SELECT id FROM task_categories WHERE user_id = $1
                    )
                ),
                'event_categories', (
                    SELECT COALESCE(json_agg(ec), '[]'::json)
                    FROM event_categories ec
                    WHERE ec.user_id = $1
                ),
                'events', (
                    SELECT COALESCE(json_agg(
                        json_build_object(
                            'id', e.id,
                            'category_id', e.category_id,
                            'title', e.title,
                            'description', e.description,
                            'start_time', e.start_time,
                            'end_time', e.end_time,
                            'color', e.color,
                            'recurrence', (
                                SELECT json_build_object(
                                    'frequency', er.frequency,
                                    'interval', er.interval,
                                    'weekly', er.weekly,
                                    'count', er.count,
                                    'until', er.until,
                                    'exceptions', er.exceptions
                                )
                                FROM event_recurrence er
                                WHERE er.event_id = e.id
                            )
                        )
                        ORDER BY e.start_time
                    ), '[]'::json)
                    FROM events e
                    JOIN event_categories ec ON e.category_id = ec.id
                    LEFT JOIN event_recurrence er ON e.id = er.event_id
                    WHERE ec.user_id = $1
                      AND (
                        (er.frequency IS NULL AND e.start_time <= $3 AND e.end_time >= $2)
                        OR (er.frequency IS NOT NULL AND e.start_time <= $3)
                      )
                )
            ) AS user_data;`,
            [session.user.id, rangeStart, rangeEndInclusive],
        );

        const minutes = new Date().getHours() * 60 + new Date().getMinutes();
        const pxPerMinute = 48 / 60;
        nowTop = minutes * pxPerMinute;
    }

    return (
        <>
            {res ? (
                <HomePage
                    body={res.rows[0].user_data}
                    settings={settings?.rows[0]}
                    nowTop={nowTop}
                />
            ) : (
                <WelcomePage supportEmail={process.env.SUPPORT_EMAIL} />
            )}
        </>
    );
}
