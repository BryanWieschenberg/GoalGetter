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
CREATE TABLE user_settings IF NOT EXISTS (
    user_id                 INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme                   theme_type NOT NULL DEFAULT 'system',
    UNIQUE(user_id)
);

CREATE TYPE token_purpose AS ENUM ('signup', 'email_change', 'password_reset');
CREATE TABLE IF NOT EXISTS auth_tokens (
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token                   TEXT PRIMARY KEY,
    purpose                 token_purpose NOT NULL,
    expires_at              TIMESTAMP NOT NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    pending_email           TEXT UNIQUE
);

-- CREATE TABLE user_profiles IF NOT EXISTS (
--     user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     avatar_url              TEXT,
--     bio                     TEXT,
--     location                TEXT,
--     birthday                DATE,
--     UNIQUE(user_id)
-- );

-- tasks(id, user_id, "order" INT NOT NULL, title, notes, status ENUM, due_date, category_id, created_at, completed_at, order_index)

-- events(id, user_id FK, title, start_ts, end_ts, is_all_day, visibility ENUM, created_at)

-- posts(id, user_id FK, kind ENUM('daily_card'), visibility ENUM('public','friends','private'), payload JSONB, created_at)

-- friends(user_id, friend_id, status ENUM('pending','accepted','blocked'), created_at, UNIQUE(user_id, friend_id))
