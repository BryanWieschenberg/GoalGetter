import { NextResponse } from "next/server";

type ValidationRule = {
    field: string;
    value: unknown;
    required?: boolean;
    type?: "string" | "number" | "boolean";
    maxLength?: number;
    minLength?: number;
    min?: number;
    max?: number;
    enum?: readonly string[];
    pattern?: RegExp;
    patternMessage?: string;
};

type ValidationError = {
    field: string;
    message: string;
};

export function validate(rules: ValidationRule[]): ValidationError | null {
    for (const rule of rules) {
        const { field, value, required, type, maxLength, minLength, min, max } = rule;

        if (required && (value === undefined || value === null || value === "")) {
            return { field, message: `${field} is required` };
        }

        if (value === undefined || value === null || value === "") {
            continue;
        }

        if (type === "string") {
            if (typeof value !== "string") {
                return { field, message: `${field} must be a string` };
            }
            if (maxLength && value.length > maxLength) {
                return { field, message: `${field} must be at most ${maxLength} characters` };
            }
            if (minLength && value.length < minLength) {
                return { field, message: `${field} must be at least ${minLength} characters` };
            }
            if (rule.pattern && !rule.pattern.test(value)) {
                return { field, message: rule.patternMessage || `${field} has an invalid format` };
            }
            if (rule.enum && !rule.enum.includes(value)) {
                return { field, message: `${field} must be one of: ${rule.enum.join(", ")}` };
            }
        }

        if (type === "number") {
            const num = typeof value === "number" ? value : Number(value);
            if (isNaN(num)) {
                return { field, message: `${field} must be a number` };
            }
            if (min !== undefined && num < min) {
                return { field, message: `${field} must be at least ${min}` };
            }
            if (max !== undefined && num > max) {
                return { field, message: `${field} must be at most ${max}` };
            }
        }

        if (type === "boolean" && typeof value !== "boolean") {
            return { field, message: `${field} must be a boolean` };
        }
    }

    return null;
}

export function validationError(err: ValidationError) {
    return NextResponse.json({ error: err.message }, { status: 400 });
}

export function sanitize(value: unknown): string {
    if (typeof value !== "string") {
        return "";
    }
    return value.trim();
}

export const MAX_TITLE = 200;
export const MAX_DESCRIPTION = 2000;
export const MAX_COLOR = 6;
export const MAX_EMAIL = 254;
export const MAX_USERNAME = 50;
export const MAX_HANDLE = 20;
export const MAX_PASSWORD = 128;

export const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export const DIRECTIONS = ["up", "down"] as const;
export const THEMES = ["system", "light", "dark"] as const;
export const WEEK_STARTS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;
