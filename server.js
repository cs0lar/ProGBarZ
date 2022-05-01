const fastify = require( 'fastify' )( { logger: true } )
const path    = require( 'path' )
const dotenv  = require( 'dotenv' )

const { Liquid } = require( 'liquidjs' )

// load the environment
dotenv.config()

// Generate Liquid Engine
const engine = new Liquid( {  
	root: path.resolve( __dirname, 'views/' ),
  	extname: '.liquid'
} )

// register the templating engine
fastify.register( require( 'point-of-view' ), {
  	engine: {
    	liquid: engine,
  	},
	root: path.resolve( __dirname, 'views/' )
} )

// register the static content handler
fastify.register( require( '@fastify/static' ), {
  	root: path.join( __dirname, 'public' ),
  	prefix: '/public/', // optional: default '/'
} )

// register the persistence engine
fastify.register( require( './plugins/db' ), {
	location: process.env.DB_LOCATION
} )

// register the routes
fastify.register( require( './routes/projects' ) )
fastify.register( require( './routes/tasks' ) )

const start = async () => {
  
  	try {
    	
    	await fastify.listen( process.env.APP_PORT )
    	fastify.log.info( `server listening on ${fastify.server.address().port}` )
  
  	} 
  	catch ( err ) {
    
    	fastify.log.error( err )

    	// terminate the persistence connection
		if ( fastify.hasOwnProperty( 'db' ) )
			fastify.db.close()
    	
    	process.exit( 1 )
  	
  	}

}

start()