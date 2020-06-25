CREATE TABLE IF NOT EXISTS pgbz_project (
	id   TEXT INTEGER PRIMARY KEY,
	name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pgbz_task (
	id          TEXT INTEGER PRIMARY KEY,
	project_id  INTEGER NOT NULL,
	description TEXT NOT NULL,
	progress    INTEGER NOT NULL DEFAULT 0,
	FOREIGN KEY (project_id) REFERENCES pgbz_project (id)
);