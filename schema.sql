CREATE TYPE provider_type AS ENUM ('inapp', 'google', 'microsoft', 'facebook', 'apple', 'github');
CREATE TYPE theme_type AS ENUM ('system', 'light', 'dark');
CREATE TYPE week_start_type AS ENUM ('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');
CREATE TYPE token_purpose AS ENUM ('signup', 'email_change', 'password_reset');
CREATE TYPE task_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE frequency_type AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

CREATE TABLE IF NOT EXISTS users (
    id                      SERIAL PRIMARY KEY,
    username                TEXT NOT NULL,
    handle                  TEXT NOT NULL UNIQUE,
    email                   TEXT NOT NULL UNIQUE,
    email_verified          BOOLEAN NOT NULL DEFAULT false,
    password                TEXT,
    provider                provider_type NOT NULL DEFAULT 'inapp',
    provider_id             TEXT
);

CREATE TABLE IF NOT EXISTS user_settings (
    user_id                 INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme                   theme_type NOT NULL DEFAULT 'system',
    week_start              week_start_type NOT NULL DEFAULT 'sun',
    timezone                VARCHAR(255) NOT NULL DEFAULT 'system'
);

CREATE TABLE IF NOT EXISTS auth_tokens (
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token                   TEXT PRIMARY KEY,
    purpose                 token_purpose NOT NULL,
    expires_at              TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    pending_email           TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS task_categories (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                    TEXT NOT NULL DEFAULT 'My Tasks',
    color                   VARCHAR(6),
    sort_order              INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS event_categories (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                    TEXT NOT NULL DEFAULT 'My Calendar',
    color                   VARCHAR(6),
    main                    BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS task_tags (
    id                      SERIAL PRIMARY KEY,
    category_id             INTEGER NOT NULL REFERENCES task_categories(id) ON DELETE CASCADE,
    name                    TEXT NOT NULL,
    color                   VARCHAR(6)
);

CREATE TABLE IF NOT EXISTS tasks (
    id                      SERIAL PRIMARY KEY,
    category_id             INTEGER NOT NULL REFERENCES task_categories(id) ON DELETE CASCADE,
    tag_id                  INTEGER REFERENCES task_tags(id) ON DELETE SET NULL,
    title                   TEXT NOT NULL,
    description             TEXT,
    due_date                DATE,
    priority                task_priority DEFAULT 'normal',
    sort_order              INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id                      SERIAL PRIMARY KEY,
    category_id             INTEGER NOT NULL REFERENCES event_categories(id) ON DELETE CASCADE,
    title                   TEXT NOT NULL,
    description             TEXT,
    start_time              TIMESTAMPTZ NOT NULL,
    end_time                TIMESTAMPTZ NOT NULL,
    color                   VARCHAR(6)
);

CREATE TABLE IF NOT EXISTS event_recurrence (
    event_id                INTEGER NOT NULL PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
    frequency               frequency_type NOT NULL,
    interval                INTEGER DEFAULT 1,
    weekly                  TEXT[],
    count                   INTEGER,
    exceptions              TIMESTAMPTZ[],
    until                   TIMESTAMPTZ
);
