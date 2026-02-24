import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGNAME,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

async function seedTasks() {
    const client = await pool.connect();
    try {
        console.log("Seeding 25,000 tasks...");

        const userId = 2; // test ID
        const categoryRes = await client.query(
            "SELECT id FROM task_categories WHERE user_id = $1 LIMIT 1",
            [userId],
        );
        const categoryId = categoryRes.rows[0].id;

        const totalTasks = 25000;
        const batchSize = 1000;

        await client.query("BEGIN");

        for (let i = 0; i < totalTasks; i++) {
            const priority = Math.random() < 0.1 ? "high" : Math.random() < 0.3 ? "medium" : "low";
            const status = Math.random() < 0.7 ? "todo" : "done";

            await client.query(
                "INSERT INTO tasks (category_id, title, description, priority, status, sort_order) VALUES ($1, $2, $3, $4, $5, $6)",
                [categoryId, `Task Benchmark #${i}`, "Massive load test task", priority, status, i],
            );

            if (i > 0 && i % batchSize === 0) {
                console.log(`Seeded ${i}/${totalTasks} tasks...`);
            }
        }

        await client.query("COMMIT");
        console.log("Successfully seeded 25,000 tasks");
    } catch (e) {
        await client.query("ROLLBACK");
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
}

seedTasks();
