CREATE DATABASE app_db;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token TEXT,
  email_verification_expires TIMESTAMP,
  last_verification_sent TIMESTAMP,
  pending_email TEXT,
  password TEXT,
  forgot_password_token TEXT,
  forgot_password_expires TIMESTAMP,
  provider TEXT DEFAULT 'inapp' CHECK (provider IN ('inapp', 'google', 'microsoft', 'facebook')),
  provider_id TEXT,
  CONSTRAINT unique_provider_user UNIQUE (provider, provider_id)
);

CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en')),
  notifications_enabled BOOLEAN DEFAULT TRUE, -- Master toggle
  notifications_inapp_enabled BOOLEAN DEFAULT TRUE,
  notifications_email_enabled BOOLEAN DEFAULT TRUE,
  task_reminder_time INTEGER DEFAULT 480, -- Reminder time before task (def 8 hrs)
  event_reminder_time INTEGER DEFAULT 60, -- Reminder time before event (def 1 hr)
  date_format TEXT DEFAULT 'MM/DD/YYYY' CHECK (date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'MM-DD-YYYY', 'DD-MM-YYYY', 'MM/DD/YY', 'DD/MM/YY', 'MM-DD-YY', 'DD-MM-YY')),
  time_format_24h BOOLEAN DEFAULT FALSE, -- false = 12h, true = 24h
  timezone TEXT DEFAULT 'America/New_York', -- def EST
  default_event_duration INTEGER DEFAULT 60, -- Default event duration when unspecified (def 1 hr)
  week_start_day TEXT DEFAULT 'Sunday' CHECK (week_start_day IN ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'))
);

-- TASKS

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

-- EVENTS

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

CREATE TABLE event_categories (

);
