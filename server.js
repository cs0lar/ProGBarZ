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

fastify.get('/', async (request, reply) => {
	// prep title
	const title = await text('ProGBarZ', {font: 'Lean'})
	// prep tasks list
	let rows = [];
	// load tasks
	try {
		const sql = 'SELECT id, name, progress FROM pgbz_task ORDER BY progress DESC'
		rows = await fastify.db.all(sql, [])
	}
	catch (err) {
		fastify.log.error(err)
	}
	finally {
		reply.view('progbarz.marko', { tasks: rows, title: title})
	}
	return reply
})

fastify.post('/add', async (request, reply) => {
	// retrieve the task name 
	const taskName = request.body.task_name
	// create and persist a new task
	const sql = 'INSERT INTO pgbz_task(name, description, created_at, updated_at, progress) VALUES (?, ?, ?, ?, ?)'
	const now = new Date().getTime()

	try {
		await fastify.db.run(sql, [taskName, '', now, now, 0])
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

fastify.post('/remove', async (request, reply) => {
	const taskId = request.body.task_id
	const sql = 'DELETE from pgbz_task WHERE id=?'

	try {
		await fastify.db.run(sql, taskId)
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

fastify.post('/update', async(request, reply) => {
	const taskProgress = request.body.task_progress
	const taskName     = request.body.task_name
	const taskId       = request.body.task_id
	const targetField  = taskName ? 'name' : 'progress'
	const target       = taskName || taskProgress

	const sql = `UPDATE pgbz_task SET ${targetField}=? WHERE id=?`

	try {
		await fastify.db.run(sql, [target, taskId])
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