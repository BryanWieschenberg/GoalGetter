export type TaskCategory = {
    id: number;
    user_id: number;
    name: string;
    color: string | null;
    sort_order: number;
};

export type Task = {
    id: number;
    title: string;
    description: string | null;
    category_id: string;
    tag_id: number | null;
    due_date: string | null;
    priority: string;
    sort_order: number;
};

export type Tag = {
    id: number;
    category_id: string;
    name: string;
    color: string | null;
};

export type EventCategory = {
    id: number;
    user_id: number;
    name: string;
    color: string | null;
    main: boolean;
};

export type Recurrence = {
    frequency: string | null;
    interval: number | null;
    weekly: string[] | null;
    count: number | null;
    exceptions: string[] | null;
    until: string | null;
};

export type Event = {
    id: number;
    category_id: number;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
    color: string | null;
    recurrence: Recurrence | null;
};
