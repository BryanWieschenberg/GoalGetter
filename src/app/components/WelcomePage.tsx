"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function WelcomePage() {
    return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-zinc-200 dark:from-zinc-800 dark:to-black">
            <motion.div
                className="flex flex-col items-center text-zinc-900 dark:text-zinc-100"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Hero Section */}
                <section className="text-center max-w-4xl px-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight pt-8 mb-4">
                        GoalGetter
                    </h1>
                    <p className="text-xl md:text-2xl font-medium mb-6 text-zinc-900 dark:text-zinc-100">
                        Your All-in-One Productivity Platform
                    </p>

                    <p className="text-lg leading-relaxed mb-6 text-zinc-800 dark:text-zinc-200">
                        Stop juggling endless apps! GoalGetter brings together your{" "}
                        <span className="font-semibold">tasks</span>{" and "}
                        <span className="font-semibold">calendar</span> into one
                        system like no other. It's designed so you can focus on doing your best work every day.
                    </p>

                    <p className="text-lg leading-relaxed mb-8 text-zinc-800 dark:text-zinc-200">
                        Simple, powerful, and motivating. Designed to help you
                        make real progress — one step at a time.
                    </p>

                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/signup"
                            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/demo"
                            className="px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                            See How It Works
                        </Link>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="mt-20 grid gap-10 max-w-5xl px-6 md:grid-cols-3">
                    <div className="p-6 border rounded-2xl shadow-sm bg-white dark:bg-zinc-900">
                        <h3 className="text-xl font-bold mb-3">Organize Everything</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Create tasks, set priorities, and manage categories.
                            Keep everything structured so nothing slips through
                            the cracks.
                        </p>
                    </div>
                    <div className="p-6 border rounded-2xl shadow-sm bg-white dark:bg-zinc-900">
                        <h3 className="text-xl font-bold mb-3">User-First</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Integrated calendar and recurring events help you
                            plan your day, week, and month with confidence.
                        </p>
                    </div>
                    <div className="p-6 border rounded-2xl shadow-sm bg-white dark:bg-zinc-900">
                        <h3 className="text-xl font-bold mb-3">Track Progress</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Get insights into your habits and progress over time.
                            Stay accountable and see how far you’ve come.
                        </p>
                    </div>
                </section>

                {/* Optional Extra Card */}
                <section className="mt-10 grid gap-10 max-w-3xl px-6">
                    <div className="p-6 border rounded-2xl shadow-sm bg-white dark:bg-zinc-900">
                        <h3 className="text-xl font-bold mb-3">Made for Humans</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            GoalGetter is designed to feel motivating — not
                            overwhelming. A clean, minimal interface that keeps
                            you focused on what matters.
                        </p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-12 mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                    <p>{'\u00A9'} 2025 GoalGetter - Bryan Wieschenbeg</p>
                </footer>
            </motion.div>
        </div>
    );
}
