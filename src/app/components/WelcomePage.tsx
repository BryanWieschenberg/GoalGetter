"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckSquare, Bell, Zap, Sparkles } from "lucide-react";
import Image from "next/image";

export default function WelcomePage({ supportEmail }: { supportEmail?: string }) {
    return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-zinc-300 dark:from-zinc-800 dark:to-black">
            <motion.div
                className="flex flex-col items-center text-zinc-900 dark:text-zinc-100"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Hero Section */}
                <section className="pt-40 pb-48 flex flex-col items-center justify-center px-48 text-center relative">
                    {/* Floating elements for visual interest */}
                    <motion.div
                        className="absolute top-20 left-10 w-20 h-20 bg-blue-500/30 rounded-full blur-xl"
                        animate={{ y: [0, -20, 0], rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute bottom-80 right-10 w-32 h-32 bg-teal-500/30 rounded-full blur-2xl"
                        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="mb-8"
                    >
                        <motion.h1
                            className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_4px_16px_rgba(0,180,255,0.4)]"
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            GoalGetter
                        </motion.h1>
                    </motion.div>

                    <motion.h2
                        className="text-2xl md:text-4xl font-light mb-12 max-w-4xl leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        {/* blue-700 to-sky-400 from-blue-500 dark:to-sky-200*/}
                        One space for{" "}
                        <span className="font-semibold text-blue-500 dark:text-blue-400">
                            everything
                        </span>{" "}
                        you need to stay on{" "}
                        <span className="font-semibold text-sky-400 dark:text-sky-300">track</span>.
                    </motion.h2>

                    <motion.p
                        className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                    >
                        The productivity experience built with{" "}
                        <span className="text-black dark:text-white font-bold">you</span> at the
                        forefront.
                        <br />A seamless split-screen interface, endless customization
                        possibilities, and a thoughtful design built for your success.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                    >
                        <Link href="/signup">
                            <motion.button
                                className="hover:cursor-pointer px-10 py-5 text-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-full font-semibold shadow-2xl"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Start Your Journey
                            </motion.button>
                        </Link>
                        <Link href="/signin">
                            <motion.button
                                className="hover:cursor-pointer px-10 py-5 text-xl border-2 border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-full font-semibold"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Sign Back In
                            </motion.button>
                        </Link>
                    </motion.div>
                </section>

                {/* Features Deep Dive */}
                <section className="pb-8 px-6 max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl font-bold pb-6 bg-gradient-to-r from-blue-700 to-sky-400 dark:from-blue-500 dark:to-sky-200 bg-clip-text text-transparent">
                            Built For Maximum Effectiveness
                        </h2>
                        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
                            Every feature designed with one goal:
                            <br />
                            Making your productivity{" "}
                            <span className="font-bold text-black dark:text-white">
                                effortless
                            </span>{" "}
                            and{" "}
                            <span className="font-bold text-black dark:text-white">intuitive</span>.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-900/20 dark:to-blue-900/20 p-8 rounded-3xl">
                                <h3 className="text-3xl font-bold mb-4 flex items-center gap-3">
                                    <Zap className="w-8 h-8 text-purple-600" />
                                    Everything in One Place
                                </h3>
                                <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-6">
                                    See your tasks and calendar simultaneously. Use the vertical bar
                                    in the center to change the width of each panel. Sort, filter,
                                    search, and customize each panel independently.
                                </p>
                                <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Easy task/event creation and modification
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Customizeable split ratios
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Advanced sorting and filtering
                                    </li>
                                </ul>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-gradient-to-br from-white to-zinc-500 dark:from-zinc-300 dark:to-zinc-600 p-1.5 rounded-3xl border-2 border-black dark:border-white"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
                                <Image
                                    src="/welcome1-using.png"
                                    alt="Split-Screen Interface Preview"
                                    width={800}
                                    height={500}
                                    className="mx-auto rounded-xl shadow-md"
                                />
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                        <motion.div
                            className="bg-gradient-to-br from-white to-zinc-500 dark:from-zinc-300 dark:to-zinc-600 p-1.5 rounded-3xl border-2 border-black dark:border-white"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
                                <Image
                                    src="/welcome2-creating.png"
                                    alt="Customization Panel Preview"
                                    width={800}
                                    height={500}
                                    className="mx-auto rounded-xl shadow-md"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            className="order-1 lg:order-2"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="bg-gradient-to-br from-teal-200 to-green-200 dark:from-teal-800/20 dark:to-green-800/20 p-8 rounded-3xl">
                                <h3 className="text-3xl font-bold mb-4 flex items-center gap-3">
                                    <Sparkles className="w-8 h-8 text-teal-600" />
                                    Infinite Customization
                                </h3>
                                <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-6">
                                    Create unlimited categories and separate tasks by tags. Set
                                    custom colors, due dates, priority levels, and repeating event
                                    capabilities. Create the perfect view for any situation.
                                </p>
                                <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Custom color-coded tasks, events, categories, and tags
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Due dates, priority levels, and repeating events
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Minimal and maximal viewing modes
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="bg-gradient-to-br from-orange-200 to-red-200 dark:from-orange-800/20 dark:to-red-800/20 p-8 rounded-3xl">
                                <h3 className="text-3xl font-bold mb-4 flex items-center gap-3">
                                    <Bell className="w-8 h-8 text-orange-600" />
                                    Never Miss a Deadline
                                </h3>
                                <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-6">
                                    Visual indicators appear right on your tasks and calendar,
                                    giving you an instant overview of approaching deadlines. Stay
                                    ahead of the game with smart, non-intrusive alerts.
                                </p>
                                <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Color-coded urgency indicators
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Subtle, non-disruptive calendar notifications
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Customizable alert preferences
                                    </li>
                                </ul>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-gradient-to-br from-white to-zinc-500 dark:from-zinc-300 dark:to-zinc-600 p-1.5 rounded-3xl border-2 border-black dark:border-white"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
                                <Image
                                    src="/welcome3-alarm.png"
                                    alt="[Smart Alerts Preview]"
                                    width={800}
                                    height={500}
                                    className="mx-auto rounded-xl shadow-md"
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-6 text-center">
                    <motion.div
                        className="max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl font-bold pb-6 bg-gradient-to-r from-blue-700 to-sky-400 dark:from-blue-500 dark:to-sky-200 bg-clip-text text-transparent">
                            Ready to Get Your Goals?
                        </h2>
                        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
                            {
                                "Transform your productivity today with GoalGetter. It's completely free."
                            }
                        </p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-6 justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <Link href="/signup">
                                <motion.button
                                    className="hover:cursor-pointer px-10 py-5 text-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-full font-semibold shadow-2xl"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Get Started Now
                                </motion.button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                <footer className="text-center">
                    <div className="w-full mt-12 mb-6" />
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-2">
                        &copy; {new Date().getFullYear()} GoalGetter. All rights reserved.
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                        Created by Bryan Wieschenberg
                    </p>
                    <div className="flex gap-4 justify-center text-xs mb-4 text-zinc-500 dark:text-zinc-400">
                        <Link
                            href="/privacy"
                            className="hover:text-zinc-900 dark:hover:text-zinc-300"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className="hover:text-zinc-900 dark:hover:text-zinc-300"
                        >
                            Terms of Service
                        </Link>
                        {supportEmail && (
                            <a
                                href={`mailto:${supportEmail}`}
                                className="text-blue-500 hover:text-blue-900 dark:hover:text-blue-300"
                            >
                                Support
                            </a>
                        )}
                    </div>
                </footer>
            </motion.div>
        </div>
    );
}
