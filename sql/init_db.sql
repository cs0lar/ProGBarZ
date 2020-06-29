CREATE TABLE IF NOT EXISTS pgbz_task (
	id          INTEGER PRIMARY KEY,
	name		TEXT NOT NULL,
	description TEXT NOT NULL,
	created_at  TEXT NOT NULL,
	updated_at  TEXT NOT NULL,
	progress    INTEGER NOT NULL DEFAULT 0
);