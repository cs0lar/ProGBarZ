const _ = require( 'underscore' )


class Utils {
	/*
	 * Given an array of progress-at-time-t objects
	 * it groups the data by task id and for each task
	 * computes a time series of progress-by-hour rates
	 */
	static computeProgressTimeSeries( series ) {
		const seriesByTaskId = _.groupBy( series, 'task_id' )
		// only consider the last N data points for each task
		const N = 50

		let ratesByTaskId = {}

		for ( const [ key, value ] of Object.entries( seriesByTaskId ) ) {
			const data = _.last( value, N )
			// data is now a list of objects ordered
			// by the timestamp property t 
			// we need to compute the series 
			// {(P_{n+1} - P_n) / (t_{n+1} - t_n)}
			// for n = 0 to data.length
			const pList = data.map( x => x.progress_at_t )
			const tList = data.map( x => parseInt( x.t ) )

			let rates = []
			
			for ( var n = 0; n < pList.length - 2; n++ ) {
				// we want delta_t in hours
				// whereby each t is in number of
				// millseconds from 01-01-1970
				let dt = ( tList[ n+1 ] - tList[ n ] ) 
				let dp = pList[ n+1 ] - pList[ n ]
				// avoid division by 0
				if ( dt > 0 )
					rates.push( dp / dt )
			}
			ratesByTaskId[ key ] = rates
		}
		return ratesByTaskId
	}
}

module.exports = Utils