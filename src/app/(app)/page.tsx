import { getServerSession } from "next-auth";
import HomePage from "./HomePage";
import WelcomePage from "../components/WelcomePage";
import authOptions from "@/lib/authOptions";
import pool from "@/lib/db";
export default async function Home() {
    const session = await getServerSession(authOptions);
    let res = null;
    let startWeek = null;
    let nowTop = 0;

    if (session) {
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
                    WHERE ec.user_id = $1
                )
            ) AS user_data;`,
            [session.user.id]
        );
        startWeek = await pool.query(
            `SELECT week_start FROM user_settings WHERE user_id = $1`,
            [session.user.id]
        );

        const minutes = new Date().getHours() * 60 + new Date().getMinutes();
        const pxPerMinute = 48 / 60;
        nowTop = minutes * pxPerMinute;
    }

    return (
        <>
            {res
                ? <HomePage
                    body={res.rows[0].user_data}
                    startWeek={startWeek?.rows[0].week_start}
                    nowTop={nowTop}
                />
                : <WelcomePage />
            }
        </>
    );
}
