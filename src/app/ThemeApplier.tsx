"use client";

import { useEffect } from "react";

export default function ThemeApplier({ theme }: { theme: "light" | "dark" | "system" }) {
    useEffect(() => {
        const root = document.documentElement;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");

        const apply = () => {
            const isDark = theme === "dark" || (theme === "system" && mq.matches);
            root.classList.toggle("dark", isDark);
        };

        apply();

        if (theme === "system") {
            mq.addEventListener("change", apply);
            return () => mq.removeEventListener("change", apply);
        }
    }, [theme]);

    return null;
}
