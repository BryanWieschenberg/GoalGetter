type task_category = {
    id: number;
    user_id: number;
    name: string;
    color: string | null;
    sort_order: number;
}

type task = {
    id: number;
    title: string;
    description: string | null;
    category_id: string;
    tag_id: number | null;
    due_date: string | null;
    priority: string;
    sort_order: number;
}

type tag = {
    id: number;
    category_id: string;
    name: string;
    color: string | null;
}

type event_category = {
    id: number;
    user_id: number;
    name: string;
    color: string | null;
    main: boolean;
}

type event = {
    id: number;
    category_id: number;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
    color: string | null;
    recurrence: {
        frequency: string | null;
        interval: number | null;
        weekly: string[] | null;
        count: number | null;
        exceptions: string[] | null;
        until: string | null;
    } | null;
}
