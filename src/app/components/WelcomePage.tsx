"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function WelcomePage() {
    return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50 to-white dark:from-zinc-800 dark:to-black">
            <motion.div
                className="flex flex-col items-center text-zinc-900 dark:text-zinc-100"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <section className="text-center max-w-3xl px-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight pt-8 mb-4">
                        GoalGetter
                    </h1>
                    <p className="text-xl md:text-2xl font-medium mb-6 text-zinc-900 dark:text-zinc-100">
                        A New Kind of Social Media Platform
                    </p>

                    <p className="text-lg leading-relaxed mb-6 text-zinc-800 dark:text-zinc-200">
                        We're tired of endless <span className="font-semibold">highlight reels</span>.  
                        GoalGetter is built for <span className="font-semibold">authenticity</span> —
                        because real life isn't all about the destination, it's about the journey.
                        Our mission is to show the world the journey can be just as brilliant as the result.
                    </p>

                    <p className="text-lg leading-relaxed mb-8 text-zinc-800 dark:text-zinc-200">
                        At its core, GoalGetter brings together state of the art <span className="font-semibold">productivity tools</span>,
                        designed to help you do the very best you can, one day at a time.
                    </p>

                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/signup"
                            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/feed"
                            className="px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                            Explore Feed
                        </Link>
                    </div>
                </section>

                <section className="mt-20 grid gap-10 max-w-5xl px-6 md:grid-cols-3">
                    <div className="p-6 border rounded-2xl shadow-sm bg-white dark:bg-zinc-900">
                        <h3 className="text-xl font-bold mb-3">Real Progress</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Share your daily progress with the world. Everyone sees the real journey, which gives everyone a healthier mindset.
                        </p>
                    </div>
                    <div className="p-6 border rounded-2xl shadow-sm bg-white dark:bg-zinc-900">
                        <h3 className="text-xl font-bold mb-3">Real Productivity</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            All the productivity tools you could ever need, working together seamlessly, in one place — simple, fast, yet powerful.
                        </p>
                    </div>
                    <div className="p-6 border rounded-2xl shadow-sm bg-white dark:bg-zinc-900">
                        <h3 className="text-xl font-bold mb-3">Real Motivation</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Shared goals and support from others keep you going, all in a way that feels so much less articial, and so much more human.
                        </p>
                    </div>
                </section>

                <footer className="mt-12 mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                    <p>© {new Date().getFullYear()} GoalGetter</p>
                </footer>
            </motion.div>
        </div>
    );
}
