class ProGBarZ {
	constructor() {
		this.barz = {}
		this.init()
	}

	init() {
		const self = this
		window.onload = () => {
			// add handlers for bar update buttons
			var incr = document.querySelectorAll("[id^='prog-incr']")
			incr.forEach( (e) => {
				e.onclick = (event) => {
					// TODO: make sure all future buttons get the listener attached
					const row = e.closest("div[id^='prog-row-']")
					const rowId = row.id.substring('prog-row-'.length)
					const selector = `#prog-progress-${rowId}`
					const value = parseInt(e.id.substring('prog-incr'.length))
					self.increment(selector, value)
				}
			} )
			// add handler for add new task button
			document.querySelector('#prog-add').onclick = (event) => {
				var taskName = prompt('Enter task: ')
				// save the task
				const url = '/add'
				const params = {
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						"task_name": taskName
					}),
					method: 'POST'
				}
				fetch(url, params)
				.then( (data) => { return data.json() })
				.then( (res) => { 
					if (res.hasOwnProperty('msg') && res.msg == 'OK')
						window.location.href = '/'
				})
				.catch( (err) => {
					console.log(err)
				})
			}
			// create and add all the bars in the DOM
			var containers = document.querySelectorAll("[id^='prog-progress-']")
			containers.forEach( (e) => {
				self.add(`#${e.id}`, e.getAttribute('data-progress'))
			})
		}
	}

	add(selector, value) {
		var bar = new ProgressBar.Line(selector, {
			strokeWidth: 4,
		  	easing: 'easeInOut',
		  	duration: 1400,
		  	color: '#FFEA82',
		  	trailColor: '#eee',
		  	trailWidth: 1,
		  	svgStyle: {width: '100%', height: '5%'},
		  	text: {
		    	style: {
			      	// Text color.
			      	// Default: same as stroke color (options.color)
			      	color: '#999',
			      	right: '0',
			      	top: '30px',
			      	padding: 0,
			      	margin: 0,
			      	transform: null
		    	},
		    	autoStyleContainer: false
		  	},
		  	from: {color: '#FFEA82'},
		  	to: {color: '#ED6A5A'},
		  	step: (state, bar) => {
		    	bar.setText(Math.round(bar.value() * 100) + ' %');
		  	}
		})
		bar.animate(value);
		this.barz[selector] = {bar: bar, value: value} 
	}

	increment(selector, percent) {
		const bar = this.barz[selector].bar
		if (bar) {
			const value = parseFloat(this.barz[selector].value) + parseFloat(percent)*0.01
			bar.set(value)
			this.barz[selector].value = value
		}
	}
}

const PgbZ = new ProGBarZ()
