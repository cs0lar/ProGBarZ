class ProGBarZ {
	constructor() {
		this.barz = {}
		this.add('.progress', 0.5)
		this.init()
	}

	init() {
		const self = this
		window.onload = () => {
			document.getElementById('incr-1').onclick = (event) => {
				self.increment('.progress', -1)
			}
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
			const value = this.barz[selector].value + percent*0.01
			bar.set(value)
			this.barz[selector].value = value
		}
	}
}

const PgbZ = new ProGBarZ()
