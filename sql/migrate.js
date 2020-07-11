const sqlite   = require('sqlite3').verbose()
const fs       = require('fs')
const path     = require('path')
const util     = require('util')
const access   = util.promisify(fs.access)
const readdir  = util.promisify(fs.readdir)
const readfile = util.promisify(fs.readFile)

const newdb   = async (location) => {
	return new Promise ( (resolve, reject) => {
		const db = new sqlite.Database(location, (err) => {
			if (err)
				return reject()
			return resolve(db)
		} )
	} )
}

const all = async (promises) => {
	return new Promise ( (resolve, reject) => {
		Promise.all (promises) 
			   .then ( (results) => {
			   		return resolve (results)
			   } )
			   .catch ( (err) => {
				   	console.log(err)
			   		return reject(err)
			   } )
	} )
}

function seq (name) {
	const regex = /migration_(\d{4})\.sql/
	const match = name.match(regex)

	if (match) 
		return match[1]

	return null
}

async function migrations (dir, start) {
	// read the directory asynchronously
	var files = (await readdir (dir)).filter ( (file) => {
		// get the sequence number of this migration file
		const index = seq(file)
		// we only retain migration files with sequence number
		// greater than or equal to the specified start
		return index && (parseInt(index) >= start)
	} )
	// return the sorted list of migration files to process
	return files.sort ( (a, b) => {
		return parseInt(seq(a)) - parseInt(seq(b))
	} )
}

( async () => {
	let db = null;
	// read the migration start and the database file from command line arguments
	let args = require('minimist')(process.argv.slice(2))
	// print the manual if something is wrong
	if (! ('db' in args)) {
		let msg = 'Usage: migrate --db=<database> [--start=<start>]\n\nWhere:\n\n'
		msg += '<database> is the absolute path to a database file.\n'
		msg += '<start> is an integer indexing the migration file to begin from.\n\n'
		msg += 'Examples:\n\n'
		msg += 'to run all migrations starting from migration_000.sql on database /opt/mydb.sqlite, run:\n\n\t'
		msg += 'node migrate --db=/opt/mydb.sqlite\n\n'
		msg += 'to run all migrations starting from migration_003.sql on database /opt/mydb.sqlite, run:\n\n\t'
		msg += 'node migrate --db=/opt/mydb.sqlite --start=3\n\n'
		
		console.log(msg)
		return process.exit(0)
	}
	try {
		// get a database connection
		db = await newdb(args.db)
		// get the list of migration files we need to process
		const files = await migrations (__dirname, args.start || 0)
		// process each file sequentially
		const promises = []
		// promisified run function from database
		const run = util.promisify(db.run).bind(db)
		// cycle through the files to process
		files.forEach( (file) => {
			const sql 		 = fs.readFileSync ( path.join(__dirname, file), 'utf8')
			const statements = sql.split (/;\s*/)
			// cycle through each statement of the migration file
			statements.forEach ( (statement) => {
				if (statement && (statement.length > 0)){
					promises.push (run(statement))}
			} )
		} )
		await all (promises) 
		console.log(`processed migrations: ${files}`)
	}
	catch (err) {
		console.log(err.message)
	}
	finally {
		if (db) 
			db.close()
	}
} )()