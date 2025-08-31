"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckSquare, Palette, Bell, Zap, Sparkles } from "lucide-react";

export default function WelcomePage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" as const }
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-zinc-200 dark:from-zinc-800 dark:to-black">
            <motion.div
                className="flex flex-col items-center text-zinc-900 dark:text-zinc-100"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Hero Section */}
                <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative">
                    {/* Floating elements for visual interest */}
                    <motion.div
                        className="absolute top-20 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl"
                        animate={{ y: [0, -20, 0], rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute bottom-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"
                        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="mb-8"
                    >
                        <div className="relative">
                            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-[#00bfff] to-[#97e4ff] bg-clip-text text-transparent">
                                GoalGetter
                            </h1>
                        </div>
                    </motion.div>

                    <motion.h2
                        className="text-2xl md:text-4xl font-light mb-12 max-w-4xl leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        One space for <span className="font-semibold text-blue-600 dark:text-blue-400">everything</span> you need to stay on <span className="font-semibold text-purple-600 dark:text-purple-400">track</span>.
                    </motion.h2>

                    <motion.p
                        className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                    >
                        The productivity experience built with <span className="text-black dark:text-white font-bold">you</span> at the forefront.
                        <br/>
                        A seamless split-screen interface, endless customization possibilities, and a thoughtful design built for your success.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-6 mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                    >
                        <Link href="/signup">
                            <motion.button
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
                                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)" }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Start Your Journey ✨
                            </motion.button>
                        </Link>
                        <Link href="/demo">
                            <motion.button
                                className="px-8 py-4 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-full text-lg font-semibold hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Watch Demo 🎬
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Feature preview cards */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="p-6 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300"
                            whileHover={{ y: -5, scale: 1.02 }}
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                                <CheckSquare className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Split-Screen Magic</h3>
                            <p className="text-zinc-600 dark:text-zinc-400">Tasks and calendar side by side, perfectly synchronized</p>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="p-6 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300"
                            whileHover={{ y: -5, scale: 1.02 }}
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                                <Bell className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Smart Alerts</h3>
                            <p className="text-zinc-600 dark:text-zinc-400">Visual deadline indicators that keep you ahead of the game</p>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="p-6 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-300"
                            whileHover={{ y: -5, scale: 1.02 }}
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl flex items-center justify-center mb-4">
                                <Palette className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Your Way</h3>
                            <p className="text-zinc-600 dark:text-zinc-400">Unlimited customization to match your workflow perfectly</p>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Features Deep Dive */}
                <section className="py-24 px-6 max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl font-bold pb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Built for You, Not the Other Way Around
                        </h2>
                        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
                            Every feature designed with one goal: making your productivity effortless and intuitive.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 p-8 rounded-3xl">
                                <h3 className="text-3xl font-bold mb-4 flex items-center gap-3">
                                    <Zap className="w-8 h-8 text-purple-600" />
                                    Revolutionary Split-Screen
                                </h3>
                                <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-6">
                                    See your tasks and calendar simultaneously. Drag tasks directly onto calendar dates, 
                                    visualize your workload, and never double-book yourself again.
                                </p>
                                <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Instant task-to-calendar scheduling
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Real-time sync between views
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Customizable split ratios
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                        
                        <motion.div
                            className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 p-8 rounded-3xl border border-zinc-300 dark:border-zinc-700"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                                [Split-Screen Interface Preview]
                            </div>
                            <div className="h-64 bg-white dark:bg-zinc-700 rounded-xl shadow-lg flex">
                                <div className="flex-1 p-4 border-r border-zinc-200 dark:border-zinc-600">
                                    <div className="text-sm font-semibold mb-3 text-purple-600 dark:text-purple-400">Tasks</div>
                                    <div className="space-y-2">
                                        <div className="h-8 bg-purple-100 dark:bg-purple-900/30 rounded"></div>
                                        <div className="h-8 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
                                        <div className="h-8 bg-teal-100 dark:bg-teal-900/30 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex-1 p-4">
                                    <div className="text-sm font-semibold mb-3 text-blue-600 dark:text-blue-400">Calendar</div>
                                    <div className="grid grid-cols-7 gap-1 text-xs">
                                        {Array.from({ length: 21 }, (_, i) => (
                                            <div key={i} className="h-6 bg-zinc-100 dark:bg-zinc-600 rounded flex items-center justify-center">
                                                {i + 1}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                        <motion.div
                            className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 p-8 rounded-3xl border border-zinc-300 dark:border-zinc-700 order-2 lg:order-1"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                                [Customization Panel Preview]
                            </div>
                            <div className="h-64 bg-white dark:bg-zinc-700 rounded-xl shadow-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Palette className="w-5 h-5 text-teal-600" />
                                    <span className="font-semibold text-teal-600 dark:text-teal-400">Categories</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                                        <div className="w-4 h-4 rounded bg-red-500"></div>
                                        <span className="text-sm">Work Projects</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                                        <span className="text-sm">Personal Goals</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                                        <div className="w-4 h-4 rounded bg-green-500"></div>
                                        <span className="text-sm">Health & Fitness</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        
                        <motion.div
                            className="order-1 lg:order-2"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-900/20 dark:to-green-900/20 p-8 rounded-3xl">
                                <h3 className="text-3xl font-bold mb-4 flex items-center gap-3">
                                    <Sparkles className="w-8 h-8 text-teal-600" />
                                    Infinite Customization
                                </h3>
                                <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-6">
                                    Create unlimited categories with custom colors. Sort, filter, and hide elements to create 
                                    the perfect view for any situation—from detailed project planning to clean minimal overviews.
                                </p>
                                <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Custom color-coded categories
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Advanced filtering and sorting
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Minimal and maximal view modes
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
                            <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 p-8 rounded-3xl">
                                <h3 className="text-3xl font-bold mb-4 flex items-center gap-3">
                                    <Bell className="w-8 h-8 text-orange-600" />
                                    Never Miss a Deadline
                                </h3>
                                <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-6">
                                    Smart visual indicators appear right on your calendar, giving you an instant overview 
                                    of approaching deadlines. Stay ahead of the game with intelligent, non-intrusive alerts.
                                </p>
                                <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Color-coded urgency indicators
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Subtle, non-disruptive notifications
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-500" />
                                        Customizable alert preferences
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                        
                        <motion.div
                            className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 p-8 rounded-3xl border border-zinc-300 dark:border-zinc-700"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                                [Smart Alerts Preview]
                            </div>
                            <div className="h-64 bg-white dark:bg-zinc-700 rounded-xl shadow-lg p-6">
                                <div className="grid grid-cols-7 gap-2 text-xs">
                                    {Array.from({ length: 35 }, (_, i) => (
                                        <div key={i} className={`h-8 rounded flex items-center justify-center relative ${
                                            i === 10 ? 'bg-red-100 dark:bg-red-900/30' :
                                            i === 15 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                            i === 22 ? 'bg-green-100 dark:bg-green-900/30' :
                                            'bg-zinc-100 dark:bg-zinc-600'
                                        }`}>
                                            {i + 1}
                                            {i === 10 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
                                            {i === 15 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>}
                                            {i === 22 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span>Urgent - Due today</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span>Soon - Due in 3 days</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Scheduled - Due next week</span>
                                    </div>
                                </div>
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
                        <h2 className="text-5xl font-bold pb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Ready to Get Your Goals?
                        </h2>
                        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
                            Transform your productivity today with GoalGetter. It's completely free.
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
                                    className="px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-xl font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
                                    whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(147, 51, 234, 0.3)" }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Get Started Free ⚡
                                </motion.button>
                            </Link>
                            
                            <Link href="/pricing">
                                <motion.button
                                    className="px-10 py-5 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-full text-xl font-semibold hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    View Pricing 💰
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
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                        Created by Bryan Wieschenberg
                    </p>
                </footer>
            </motion.div>
        </div>
    );
}