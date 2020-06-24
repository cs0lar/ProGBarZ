const fastify = require('fastify')({ logger: true })
const path    = require('path')

// register templating engine
fastify.register(require('point-of-view'), {
	engine: {
		marko: require('marko'),
	}
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
}

start()