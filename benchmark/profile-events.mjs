import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGNAME,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

async function profile() {
    try {
        const userId = 2; // test ID
        const start = "2026-05-09";
        const endInclusive = "2026-05-15 23:59:59";

        const query = `
            EXPLAIN ANALYZE
            SELECT
                e.id, e.title, e.description, e.category_id, e.color, e.start_time, e.end_time,
                r.frequency, r.interval, r.weekly, r.count, r.exceptions, r.until
            FROM events e
            JOIN event_categories ec ON e.category_id = ec.id
            LEFT JOIN event_recurrence r ON e.id = r.event_id
            WHERE ec.user_id = $1
              AND (
                (r.frequency IS NULL AND e.start_time <= $3 AND e.end_time >= $2)
                OR (r.frequency IS NOT NULL AND e.start_time <= $3)
              )
            ORDER BY e.start_time ASC
        `;

        const res = await pool.query(query, [userId, start, endInclusive]);
        console.log("EXPLAIN ANALYZE Results:");
        res.rows.forEach((row) => console.log(row["QUERY PLAN"]));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

profile();
