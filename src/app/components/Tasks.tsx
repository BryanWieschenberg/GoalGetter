'use client';

export default function Tasks({ taskData }: { taskData: any }) {
    const categories = taskData?.task_categories ?? [];
    const tags = taskData?.task_tags ?? [];
    const tasks = taskData?.tasks ?? [];

    const tagById = (id?: number) => tags.find((t: any) => t.id === id);

    const uncategorized = tasks.filter((t: any) => !t.category_id);

    return (
        <div className="p-8">
            {categories.map((cat: any) => {
                const catTasks = tasks.filter((t: any) => t.category_id === cat.id);

                return (
                    <section key={cat.id} className="mb-8">
                        <h2
                            className="text-xl font-bold mb-3"
                            style={{ color: cat.color ? `#${cat.color}` : undefined }}
                        >
                            {cat.name}
                        </h2>

                        {catTasks.length === 0 ? (
                            <p className="text-zinc-500">No tasks in this category.</p>
                        ) : (
                            <ul className="space-y-3">
                                {catTasks.map((task: any) => {
                                    const tag = tagById(task.tag_id);
                                    return (
                                        <li
                                            key={task.id}
                                            style={{ borderColor: cat.color ? `#${cat.color}` : undefined }}
                                        >
                                            <h3
                                                style={{ color: tag?.color ? `#${tag.color}` : undefined }}
                                            >
                                                <span className="font-semibold">{task.title}</span>
                                                {task.description && (
                                                    <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-400">
                                                        {task.description}
                                                    </span>
                                                )}
                                            </h3>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                );
            })}

            {uncategorized.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-3">Uncategorized</h2>
                    <ul className="space-y-3">
                        {uncategorized.map((task: any) => {
                            const tag = tagById(task.tag_id);
                            return (
                                <li key={task.id} className="rounded border p-3">
                                    <h3
                                        className="font-semibold"
                                        style={{
                                            color: tag?.color ? `#${tag.color}` : undefined
                                        }}
                                    >
                                        {task.title}
                                    </h3>
                                    {task.description && (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            {task.description}
                                        </p>
                                    )}
                                    <div className="mt-1 text-sm">
                                        <span className="text-zinc-500 mr-2">Tag:</span>
                                        <span
                                            style={{
                                                color: tag?.color ? `#${tag.color}` : undefined,
                                                fontWeight: tag ? (600 as const) : (400 as const)
                                            }}
                                        >
                                            {tag ? tag.name : "None"}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}
        </div>
    );
}
