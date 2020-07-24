const fastify = require('fastify')({ logger: true })
const path    = require('path')
const dotenv  = require('dotenv')
const figlet  = require('figlet')
const util    = require('util')

const text    = util.promisify(figlet.text)

// load the environment
dotenv.config()

// register templating engine
fastify.register(require('point-of-view'), {
	engine: {
		marko: require('marko'),
	}
})

// register the static content handler
fastify.register(require('fastify-static'), {
  	root: path.join(__dirname, 'public'),
  	prefix: '/public/', // optional: default '/'
})

// register the persistence engine
fastify.register(require('./db'), {
	location: process.env.DB_LOCATION
})

fastify.get('/:projectId', async (request, reply) => {
	// prep title
	const title = await text('ProGBarZ', {font: 'Lean'})
	// prep tasks list
	let tasks = [];
	let projects = [];
	let projectId = null;
	try {
		// load projects
		let sql  = 'SELECT id, name FROM pgbz_project ORDER BY name'
		projects = await fastify.db.all(sql, []) 
		// check if we have a project Id in the request ...
		projectId = request.params.projectId || projects[0].id || 0
		// ... otherwise load tasks for first project if any
		if (projectId) {
			// TODO: get last selected project from session or db
			sql = 'SELECT t.id, t.name, t.progress FROM pgbz_task t, pgbz_project_tasks pt WHERE pt.project_id=? AND t.id = pt.task_id ORDER BY progress DESC'
			tasks = await fastify.db.all(sql, [projectId])
		}
	}
	catch (err) {
		fastify.log.error(err)
	}
	finally {
		reply.view('progbarz.marko', { projects: projects, tasks: tasks, title: title, selected: projectId })
	}
	return reply
})

fastify.post('/tasks/add', async (request, reply) => {
	// retrieve the task name 
	const taskName = request.body.task_name
	// retrieve the project id
	const projectId = request.body.project_id
	// create and persist a new task
	const sql = 'INSERT INTO pgbz_task(name, description, created_at, updated_at, progress) VALUES (?, ?, ?, ?, ?)'
	const now = new Date().getTime()

	try {
		await fastify.db.run(sql, [taskName, '', now, now, 0])
		// update the link between project and task
		await fastify.db.run('INSERT INTO pgbz_project_tasks (project_id, task_id) VALUES (?, last_insert_rowid())', [projectId])
		
		reply.code(201)
			 .header('Content-Type', 'application/json; charset=utf-8')
			 .send({msg: 'OK'})	
	}
	catch (err) {
		fastify.log.error(err)
		reply.code(500)
		     .type('text/plain')
		     .send(err.message)
	}

	return reply
})

fastify.post('/projects/add', async (request, reply) => {
	// retrieve project name
	const projName = request.body.project_name
	const now      = new Date().getTime()
	const sql      = 'INSERT INTO pgbz_project (name, created_at, updated_at) VALUES (?, ?, ?)'

	try {
		await fastify.db.run(sql, [projName, now, now])

		reply.code(201)
		     .header('Content-Type', 'application/json; charset=utf-8')
		     .send({msg: 'OK'})
	}
	catch (err) {
		fastify.log.error(err)
		reply.code(500)
		     .type('text/plain')
		     .send(err.message)
	}
})

fastify.post('/tasks/remove', async (request, reply) => {
	const taskId    = request.body.task_id
	const projectId = request.body.project_id
	const sql       = 'DELETE FROM pgbz_task WHERE id=?'

	try {
		await fastify.db.run(sql, taskId)
		await fastify.db.run('DELETE FROM pgbz_project_tasks WHERE task_id=?', taskId)
		reply.code(200)
		     .header('Content-Type', 'application/json; charset=utf-8')
			 .send({msg: 'OK'})
	}
	catch (err) {
		fastify.log.error(err)
		reply.code(500)
		     .type('text/plain')
		     .send(err.message)
	}

	return reply
})

fastify.post('/tasks/update', async(request, reply) => {
	const taskProgress = request.body.task_progress
	const taskName     = request.body.task_name
	const taskId       = request.body.task_id
	const targetField  = taskName ? 'name' : 'progress'
	const target       = taskName || taskProgress
	const now          = new Date().getTime()

	const sql = `UPDATE pgbz_task SET ${targetField}=?, updated_at=? WHERE id=?`

	try {
		await fastify.db.run(sql, [target, now, taskId])
		reply.code(200)
		     .header('Content-Type', 'application/json; charset=utf-8')
			 .send({msg: 'OK'})
	}
	catch (err) {
		fastify.log.error(err)
		reply.code(500)
		     .type('text/plain')
		     .send(err.message)
	}

	return reply
})

const start = async () => {
	try {
		await fastify.listen(3000)
		fastify.log.info(`server listening on ${fastify.server.address().port}`)
	}
	catch (err) {
		fastify.log.error(err)
		// terminate the persistence connection
		if (fastify.hasOwnProperty('db'))
			fastify.db.close()
		process.exit(1)
	}
}

start()