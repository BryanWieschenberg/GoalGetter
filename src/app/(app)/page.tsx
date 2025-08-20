import { getServerSession } from "next-auth";
import HomePage from "./HomePage";
import WelcomePage from "../components/WelcomePage";
import authOptions from "@/lib/authOptions";
import pool from "@/lib/db";
export default async function Home() {
    const session = await getServerSession(authOptions);
    let res = null;
    let startWeek = null;

    if (session) {
        res = await pool.query(
            `SELECT json_build_object(
                'task_categories', (
                    SELECT COALESCE(json_agg(c), '[]'::json) 
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
                    SELECT COALESCE(json_agg(t), '[]'::json) 
                    FROM tasks t
                    WHERE t.category_id IN (
                        SELECT id FROM task_categories WHERE user_id = $1
                    )
                ),
                'events', (
                    SELECT COALESCE(json_agg(e), '[]'::json) 
                    FROM events e 
                    WHERE e.user_id = $1
                )
            ) AS user_data;`,
            [session.user.id]
        );
        startWeek = await pool.query(
            `SELECT week_start FROM user_settings WHERE user_id = $1`,
            [session.user.id]
        );
    }

    return (
        <>
            {res
                ? <HomePage body={res.rows[0].user_data} startWeek={startWeek?.rows[0].week_start} />
                : <WelcomePage />
            }
        </>
    );
}
