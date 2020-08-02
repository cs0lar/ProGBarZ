CREATE TABLE IF NOT EXISTS pgbz_progress_time (
	task_id INTEGER NOT NULL,
	progress_at_t INTEGER NOT NULL,
	t TEXT NOT NULL,
	FOREIGN KEY (task_id) REFERENCES pgbz_task(id) ON DELETE CASCADE,
	UNIQUE (task_id, progress_at_t, t)
);

INSERT INTO pgbz_progress_time (task_id, progress_at_t, t) SELECT id, progress, updated_at FROM pgbz_task;