
window.onload = function onLoad() {
    var bar = new ProgressBar.Line('.progress', {
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
	});

	bar.animate(0.5); 
};