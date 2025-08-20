'use client';

import { useState } from "react";

export default function Tasks({ taskData }: { taskData: any }) {
    const categories = taskData?.task_categories ?? [];
    const tags = taskData?.task_tags ?? [];
    const tasks = taskData?.tasks ?? [];
    const [hoveredTask, setHoveredTask] = useState<number | null>(null);
    const [hoveredCat, setHoveredCat] = useState<number | null>(null);

    const tagById = (id?: number) => tags.find((t: any) => t.id === id);

    return (
        <div className="p-8">
            {categories.map((cat: any) => {
                const catTasks = tasks.filter((t: any) => t.category_id === cat.id);

                return (
                    <section key={cat.id} className="mb-8">
                        <h2
                            className="text-xl font-bold mb-3"
                            style={{ color: cat.color ? `#${cat.color}` : undefined }}
                            onMouseEnter={() => setHoveredCat(cat.id)}
                            onMouseLeave={() => setHoveredCat(null)}
                        >
                            {cat.name}
                            {hoveredCat === cat.id && (
                                <span className="ml-2 text-red-500">a</span>
                            )}
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
                                            onMouseEnter={() => setHoveredTask(task.id)}
                                            onMouseLeave={() => setHoveredTask(null)}
                                            style={{ borderColor: cat.color ? `#${cat.color}` : undefined }}
                                        >
                                            <h3
                                                className="whitespace-nowrap inline-block"
                                                style={{ color: tag?.color ? `#${tag.color}` : undefined }}
                                            >
                                                <span className="font-semibold">{task.title}</span>
                                                {task.description && (
                                                    <span className="ml-3 text-sm text-zinc-800 dark:text-zinc-200">
                                                        {task.description}
                                                    </span>
                                                )}
                                                {hoveredTask === task.id && (
                                                    <span className="ml-2 text-red-500">a</span>
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
        </div>
    );
}
