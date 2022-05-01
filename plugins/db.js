const fastifyPlugin = require( 'fastify-plugin' )
const sqlite        = require( 'sqlite3' ).verbose()
const fs            = require( 'fs' )
const util          = require( 'util' )
const { spawn } 	= require( 'child_process' )
const access        = util.promisify( fs.access )

async function db ( fastify, options ) {
	const location = options.location
	delete options.location

	let db = null

	try {
		// check it the database exists
		await access ( location, fs.F_OK )
	}
	catch ( err ) {
		fastify.log.error( `Database not found @ ${location}, creating ...` )
		// if we are here we need to create
		// a new database at `location`
		db = new sqlite.Database( location )
		const sql        = fs.readFileSync( './sql/init_db.sql', 'utf8' )
		const statements = sql.split( /;\s*/ )

		statements.forEach( ( statement ) => {
			if ( statement && ( statement.length > 0 ) )
				db.run( statement )
		} )
		// run all existing migrations if any
		const migrate = spawn( 'npm', ['run', 'migrate', '--', `--db=${location}`] )
		// show any errors
		migrate.stderr.on( 'data', ( data ) => {
			fastify.log.error( `migration error: ${data}` )
		} )
		// show final outcome
		migrate.on( 'close', ( code ) => {
			fastify.log.info( `migrations exited with code ${code}` )
		} )
	}
	finally {
		if ( db == null )
			db = new sqlite.Database( location )
		// finally decorate the server with  
		// the database connection details
		const promisifiedDb = {
			run: util.promisify( db.run ).bind( db ),
			all: util.promisify( db.all ).bind( db ),
			close: db.close.bind(db)
		}
		fastify.decorate( 'db', promisifiedDb )
	}
}

module.exports = fastifyPlugin( db )