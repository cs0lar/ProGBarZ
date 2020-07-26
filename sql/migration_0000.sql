CREATE TABLE IF NOT EXISTS pgbz_project (
	id			INTEGER PRIMARY KEY,
	name		TEXT	NOT NULL,
	created_at	TEXT	NOT NULL,
	updated_at 	TEXT	NOT NULL
);

CREATE TABLE IF NOT EXISTS pgbz_project_tasks (
	project_id	INTEGER NOT NULL,
	task_id		INTEGER NOT NULL,
	FOREIGN KEY (project_id) REFERENCES pgbz_project(id) ON DELETE CASCADE,
	FOREIGN KEY (task_id)	 REFERENCES pgbz_task(id) ON DELETE CASCADE,
	UNIQUE (project_id, task_id)
);
