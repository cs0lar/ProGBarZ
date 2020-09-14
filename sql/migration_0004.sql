ALTER TABLE pgbz_project RENAME TO pgbz_project_orig;

CREATE TABLE pgbz_project (
	id			INTEGER PRIMARY KEY,
	name		TEXT	NOT NULL,
	is_active   INTEGER NOT NULL DEFAULT 1,
	duration	INTEGER NOT NULL DEFAULT 0,
	created_at	TEXT	NOT NULL,
	updated_at 	TEXT	NOT NULL
);

INSERT INTO pgbz_project (name, is_active, created_at, updated_at) SELECT name, is_active, created_at, updated_at FROM pgbz_project_orig;

DROP TABLE pgbz_project_orig;