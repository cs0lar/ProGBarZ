const fastify = require('fastify')({ logger: true })
const path    = require('path')
const dotenv  = require('dotenv')

// load the environment
dotenv.config()

// register templating engine
fastify.register(require('point-of-view'), {
	engine: {
		marko: require('marko'),
	}
})

// register the persistence engine
fastify.register(require('./db'), {
	location: process.env.DB_LOCATION
})

fastify.get('/', async (request, reply) => {
	reply.view('progbarz.marko', { hello: 'world' })
	return reply
})


const start = async () => {
	try {
		await fastify.listen(3000)
		fastify.log.info(`server listening on ${fastify.server.address().port}`)
	}
	catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
	finally {
		// terminate the persistence connection
		if (fastify.hasOwnProperty('db'))
			fastify.db.close()
	}
}

start()