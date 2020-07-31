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
					self.increment(selector, value, rowId)
				}
			} )
			// add handler for add-new-task button
			document.querySelector('#prog-add').onclick = (event) => {
				var taskName = prompt('Enter task: ')
				const projectId = document.querySelector(".selected").getAttribute('data-project')
				return self.task(taskName, projectId)
			}
			// add handler for add-new-project button
			document.querySelector('#prog-project-add').onclick = (event) => {
				var projName = prompt('Enter project: ')
				return self.project(projName)
			}
			// create and add all the bars in the DOM
			var containers = document.querySelectorAll("[id^='prog-progress-']")
			containers.forEach( (e) => {
				self.add(`#${e.id}`, e.getAttribute('data-progress'))
			} )
			// task delete handler
			var remove = document.querySelectorAll("[id^='prog-remove-']")
			remove.forEach( (e) => {
				e.onclick = (event) => {
					var taskId = e.getAttribute('data-task')
					const projectId = document.querySelector(".selected").getAttribute('data-project')
					return self.remove(taskId, projectId)
				}
			} )		
			// project archive handler
			var archive = document.querySelectorAll("[id^='prog-archive-']")
			archive.forEach( (e) => {
				e.onclick = (event) => {
					var projectId = e.getAttribute('data-project')
					var confirmation = confirm('Are you sure you want to archive this Project?')
					if (confirmation == true)
						return self.archive(projectId)
				}
			} )
			// task name edit handler
			var editable = document.querySelectorAll('.editable')
			editable.forEach( (e) => {
				e.onblur = (event) => {
					var taskId   = e.getAttribute('data-task')
					var taskName = e.textContent
					return self.update(taskId, taskName)
				}
			} )			
			// project name edit handler
			var editableProj = document.querySelectorAll('.proj-editable')
			editableProj.forEach( (e) => {
				e.onblur = (event) => {
					var projId   = e.getAttribute('data-project')
					var projName = e.textContent
					return self.projectUpdate(projId, projName) 
				}
			} )
			// initialise sparklines
			var sparklines = document.querySelectorAll('.sparkline')
			sparklines.forEach( (s) => {
				sparkline.sparkline(s, [1, 5, 2, 4, 8, 3, 7, 9, 9, 2]);
			} )
		}
	}

	remove(taskId, projectId) {
		const url  = '/tasks/remove'
		const params = {
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'task_id': taskId
			}),
			method: 'POST'
		}

		fetch(url, params)
		.then( (data) => { return data.json() } )
		.then( (res) => {
			if (res.hasOwnProperty('msg') && res.msg == 'OK')
				window.location.href = `/${projectId}`
		} )
		.catch( (err) => {
			console.log(err)
		} )
	}

	archive(projectId) {
		const url = '/projects/update'
		const params = {
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'project_id': projectId,
				'is_active' : 0
			}),
			method: 'POST'
		}

		fetch(url, params)
		.then( (data) => { return data.json() } )
		.then( (res) => {
			if (res.hasOwnProperty('msg') && res.msg == 'OK')
				window.location.href = '/'
		} )
		.catch( (err) => {
			console.log(err)
		} )
	}

	task(taskName, project) {
		// save the task
		const url = '/tasks/add'
		const params = {
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'task_name':  taskName,
				'project_id': project
			}),
			method: 'POST'
		}
		fetch(url, params)
		.then( (data) => { return data.json() } )
		.then( (res) => { 
			if (res.hasOwnProperty('msg') && res.msg == 'OK')
				window.location.href = `/${project}`
		} )
		.catch( (err) => {
			console.log(err)
		} )
	}

	project(projName) {
		// save the new project
		const url = '/projects/add'
		const params = {
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'project_name': projName
			}),
			method: 'POST'
		}
		fetch(url, params)
		.then( (data) => { return data.json() } )
		.then( (res) => {
			if (res.hasOwnProperty('msg') && res.msg == 'OK')
				window.location.href = '/'
		} )
		.catch( (err) => {
			console.log(err)
		} )
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
		bar.animate(value * 0.01);
		this.barz[selector] = {bar: bar, value: value * 0.01} 
	}

	increment(selector, percent, taskId) {
		const bar = this.barz[selector].bar
		if (bar) {
			var value = parseFloat(this.barz[selector].value) + parseFloat(percent)*0.01
			value = Math.round(value * 100)/100

			if (value >= 0.0 && value <= 1.0) {
				bar.set(value)
				this.barz[selector].value = value
				// persist the update
				const url = '/tasks/update'
				const params = {
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						'task_progress': Math.round(value * 100),
						'task_id': taskId
					}),
					method: 'POST'
				}
				fetch(url, params)
				.then( (data) => { return data.json() } )
				.then( (res) => {} )
				.catch( (err) => {
					console.log(err)
				} )
			}
		}
	}

	update(taskId, taskName) {
		const url = '/tasks/update'
		const params = {
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'task_id': taskId,
				'task_name': taskName
			}),
			method: 'POST'
		}
		fetch(url, params)
		.then( (data) => { return data.json() } )
		.then( (res) => { } )
		.catch( (err) => {
			console.log(err)
		} )
	}

	projectUpdate(projId, projName) {
		const url = '/projects/update'
		const params = {
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'project_id': projId,
				'project_name': projName
			}),
			method: 'POST'
		}
		fetch(url, params)
		.then( (data) => { return data.json() } )
		.then( (res) => { })
		.catch( (err) => {
			console.log(err)
		} )
	}

	openNav() {
		document.getElementById('prog-projects-sidenav').style.width = '300px'
	}

	closeNav() {
		document.getElementById('prog-projects-sidenav').style.width = '0px'
	}
}

const PgbZ = new ProGBarZ()
