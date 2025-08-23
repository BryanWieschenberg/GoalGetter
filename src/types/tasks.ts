type task = {
    id: number;
    title: string;
    description: string | null;
    category_id: string;
    tag_id: string | null;
    due_date: string | null;
    priority: string;
    sort_order: number;
}

type category = {
    id: string;
    user_id: number;
    name: string;
    color: string | null;
    sort_order: number;
}

type tag = {
    id: string;
    category_id: string;
    name: string;
    color: string | null;
}
