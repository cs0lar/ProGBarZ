

async function routes( fastify, options ) {

	fastify.post( '/tasks/add', async ( request, reply ) => {

		// retrieve the task name 
		const taskName = request.body.task_name
		// retrieve the project id
		const projectId = request.body.project_id
		// create and persist a new task
		const sql = 'INSERT INTO pgbz_task(name, description, created_at, updated_at, progress) VALUES (?, ?, ?, ?, ?)'
		const now = new Date().getTime()

		try {
			await fastify.db.run( sql, [ taskName, '', now, now, 0 ] )
			// update the link between project and task
			await fastify.db.run( 'INSERT INTO pgbz_project_tasks (project_id, task_id) VALUES (?, last_insert_rowid())', [ projectId ] )

			reply.code( 201 )
				 .header( 'Content-Type', 'application/json; charset=utf-8' )
				 .send( { msg: 'OK' } )	
		}
		catch ( err ) {
			fastify.log.error( err )
			reply.code( 500 )
			     .type( 'text/plain' )
			     .send( err.message )
		}

		return reply

	} )

	fastify.post( '/tasks/remove', async ( request, reply ) => {
		
		const taskId    = request.body.task_id
		const projectId = request.body.project_id
		const sql       = 'DELETE FROM pgbz_task WHERE id=?'

		try {
			await fastify.db.run( sql, taskId )
			await fastify.db.run( 'DELETE FROM pgbz_project_tasks WHERE task_id=?', taskId )
			await fastify.db.run( 'DELETE FROM pgbz_progress_time WHERE task_id=?', taskId )
			reply.code( 200 )
			     .header( 'Content-Type', 'application/json; charset=utf-8' )
				 .send( { msg: 'OK' } )
		}
		catch ( err ) {
			fastify.log.error( err )
			reply.code( 500 )
			     .type( 'text/plain' )
			     .send( err.message )
		}

		return reply
	
	} )

	fastify.post( '/tasks/update', async( request, reply ) => {

		const taskProgress = request.body.task_progress
		const taskName     = request.body.task_name
		const taskId       = request.body.task_id
		const targetField  = taskName ? 'name' : 'progress'
		const target       = taskName || taskProgress
		const now          = new Date().getTime()

		const sql = `UPDATE pgbz_task SET ${targetField}=?, updated_at=? WHERE id=?`

		try {
			await fastify.db.run( sql, [ target, now, taskId ] )
			// if this is a progress update
			// add this data point to the task progress time series
			if ( targetField == 'progress' )
				await fastify.db.run( 'INSERT INTO pgbz_progress_time (task_id, progress_at_t, t) VALUES (?, ?, ?)', [ taskId, target, now ] )
			
			reply.code( 200 )
			     .header( 'Content-Type', 'application/json; charset=utf-8' )
				 .send( { msg: 'OK' } )
		}
		catch ( err ) {
			fastify.log.error( err )
			reply.code( 500 )
			     .type( 'text/plain' )
			     .send( err.message )
		}

		return reply
	
	} )

}

module.exports = routes 