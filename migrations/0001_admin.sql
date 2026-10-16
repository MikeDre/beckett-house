CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL, updated_by TEXT);
CREATE TABLE submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, kind TEXT NOT NULL, nursery TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, fields TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new');
CREATE INDEX submissions_created_at ON submissions(created_at);
CREATE TABLE activity (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, user TEXT NOT NULL, action TEXT NOT NULL, summary TEXT);
