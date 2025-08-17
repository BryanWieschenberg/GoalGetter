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
CREATE TABLE user_settings IF NOT EXISTS (
    user_id                 INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme                   theme_type NOT NULL DEFAULT 'system',
    week_start              week_start_type NOT NULL DEFAULT 'sun',
    UNIQUE(user_id)
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

-- WARNING: The following below have not been dumby-checked yet

CREATE TABLE user_profiles IF NOT EXISTS (
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_url              TEXT,
    bio                     TEXT,
    location                TEXT,
    birthday                DATE,
    UNIQUE(user_id)
);

CREATE TABLE task_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50)
);

CREATE TABLE task_tags (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES task_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50)
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES task_categories(id) ON DELETE SET NULL,
    tag_id INTEGER REFERENCES task_tags(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    google_id VARCHAR(255), -- For if it's from Google Calendar, for syncing
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    recurrence TEXT[], -- Array of RRULEs like 'FREQ=WEEKLY;COUNT=10'
    color VARCHAR(50),
);
