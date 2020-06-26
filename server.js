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
	// load projects
	const sql = 'SELECT id, name FROM pgbz_project ORDER BY name'
	fastify.db.all(sql, [], (err, rows) => {
		if (err) {
			fastify.log.error(err)
			reply.code(500)
		}
		else {
			reply.view('progbarz.marko', { projects: rows, title: title})
		}
	})
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