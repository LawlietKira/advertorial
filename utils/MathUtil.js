var R = require('ramda');

var MathUtil = function(){};


MathUtil.cosine = function(v1, v2){
	if(R.length(v1) !== R.length(v2)){
		var max = Math.max(R.length(v1), R.length(v2));
		var min = Math.min(R.length(v1), R.length(v2));
		for(var i = min;i<max;i++){
			v1[i] = v1[i] || 0;
			v2[i] = v2[i] || 0;
		}
	}
	
	var m = 0;
	var a = 0;
	var b = 0;
	for(var i=0;i<R.length(v1);i++){
		m += v1[i]*v2[i];
		a += v1[i]*v1[i];
		b += v2[i]*v2[i];
	}
	return m/Math.sqrt(a*b);
}

module.exports = MathUtil;