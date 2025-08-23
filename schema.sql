CREATE TYPE provider_type AS ENUM ('', 'google', 'microsoft', 'facebook', 'apple', 'github');
CREATE TABLE users IF NOT EXISTS (
    id                      SERIAL PRIMARY KEY,
    username                TEXT NOT NULL,
    handle                  TEXT NOT NULL UNIQUE,
    email                   TEXT NOT NULL UNIQUE,
    email_verified          BOOLEAN NOT NULL DEFAULT false,
    password                TEXT,
    provider                provider_type NOT NULL DEFAULT '',
    provider_id             TEXT
);

CREATE TYPE theme_type AS ENUM ('system', 'light', 'dark');
CREATE TYPE week_start_type AS ENUM ('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');
CREATE TABLE IF NOT EXISTS user_settings (
    user_id                 INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme                   theme_type NOT NULL DEFAULT 'system',
    week_start              week_start_type NOT NULL DEFAULT 'sun'
);

CREATE TYPE token_purpose AS ENUM ('signup', 'email_change', 'password_reset');
CREATE TABLE IF NOT EXISTS auth_tokens (
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token                   TEXT PRIMARY KEY,
    purpose                 token_purpose NOT NULL,
    expires_at              TIMESTAMP NOT NULL DEFAULT (now() + interval '7 days'),
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    pending_email           TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS task_categories (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                    TEXT NOT NULL,
    color                   VARCHAR(6),
    sort_order              INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS task_tags (
    id                      SERIAL PRIMARY KEY,
    category_id             INTEGER NOT NULL REFERENCES task_categories(id) ON DELETE CASCADE,
    name                    TEXT NOT NULL,
    color                   VARCHAR(6)
);

CREATE TYPE task_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TABLE IF NOT EXISTS tasks (
    id                      SERIAL PRIMARY KEY,
    category_id             INTEGER REFERENCES task_categories(id) ON DELETE CASCADE,
    tag_id                  INTEGER REFERENCES task_tags(id) ON DELETE SET NULL,
    title                   TEXT NOT NULL,
    description             TEXT,
    due_date                DATE,
    priority                task_priority DEFAULT 'normal',
    sort_order              INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS today_tasks (
    task_id                 INTEGER PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
    sort_order              INTEGER NOT NULL
);

-- WARNING: The following below have not been dumby-checked yet

CREATE TABLE IF NOT EXISTS events (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title                   TEXT NOT NULL,
    description             TEXT,
    start_time              TIMESTAMP NOT NULL,
    end_time                TIMESTAMP NOT NULL,
    recurrence              TEXT[], -- Array of RRULEs like 'FREQ=WEEKLY;COUNT=10'
    color                   VARCHAR(6)
);

-- POST-MVP TABLES, IGNORE FOR NOW

CREATE TABLE IF NOT EXISTS user_profiles IF NOT EXISTS (
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_url              TEXT,
    bio                     TEXT,
    location                TEXT,
    birthday                DATE,
    UNIQUE(user_id)
);
