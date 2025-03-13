CREATE TABLE IF NOT EXISTS Setting (
    id TEXT PRIMARY KEY,                      -- Unique identifier for each setting
    key TEXT NOT NULL UNIQUE,                 -- The key of the setting
    value TEXT NOT NULL,                      -- The value of the setting
    createdAt TEXT NOT NULL,                  -- Timestamp of when the setting was created
    updatedAt TEXT NOT NULL                   -- Timestamp of when the setting was updated
);
