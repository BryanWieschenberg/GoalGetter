import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGNAME,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

async function seed() {
    const client = await pool.connect();
    try {
        console.log("Seeding 25,000 events...");

        const userId = 2; // test ID
        const categoryRes = await client.query(
            "SELECT id FROM event_categories WHERE user_id = $1 LIMIT 1",
            [userId],
        );
        const categoryId = categoryRes.rows[0].id;

        const totalWeeks = 250;
        const eventsPerWeek = 100;
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - (totalWeeks / 2) * 7);

        await client.query("BEGIN");

        for (let w = 0; w < totalWeeks; w++) {
            const weekDate = new Date(startDate);
            weekDate.setDate(weekDate.getDate() + w * 7);

            for (let i = 0; i < eventsPerWeek; i++) {
                const dayOffset = Math.floor(Math.random() * 7);
                const hour = Math.floor(Math.random() * 24);
                const start = new Date(weekDate);
                start.setDate(start.getDate() + dayOffset);
                start.setHours(hour, 0, 0, 0);

                const end = new Date(start);
                end.setHours(start.getHours() + 1);

                const eventRes = await client.query(
                    "INSERT INTO events (category_id, title, description, start_time, end_time, color) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
                    [categoryId, `Event W${w} E${i}`, "Benchmark event", start, end, "3b82f6"],
                );

                if (Math.random() < 0.2) {
                    await client.query(
                        "INSERT INTO event_recurrence (event_id, frequency, interval) VALUES ($1, $2, $3)",
                        [eventRes.rows[0].id, "weekly", 1],
                    );
                }
            }
            if (w % 10 === 0) console.log(`Week ${w}/${totalWeeks} seeded...`);
        }

        await client.query("COMMIT");
        console.log("Successfully seeded 25,000 events");
    } catch (e) {
        await client.query("ROLLBACK");
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
