CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    handle TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    provider ENUM('', 'google') NOT NULL DEFAULT '',
    provider_id TEXT
);

// "order" INT NOT NULL,

users(id, username UNIQUE, email UNIQUE, display_name, avatar_url, bio, tz, created_at)

tasks(id, user_id FK, title, notes, status ENUM, due_date, category_id, created_at, completed_at, order_index)

events(id, user_id FK, title, start_ts, end_ts, is_all_day, visibility ENUM, created_at)

posts(id, user_id FK, kind ENUM('daily_card'), visibility ENUM('public','friends','private'), payload JSONB, created_at)

friends(user_id, friend_id, status ENUM('pending','accepted','blocked'), created_at, UNIQUE(user_id, friend_id))

