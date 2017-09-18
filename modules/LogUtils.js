var R = require('ramda');
var LogUtils = function() {
	this.index = 0;
};

LogUtils.prototype.log = function(json, name) {
	console.log(this.index++ + String(name) + ' :');
	console.log(JSON.stringify(json));
}

LogUtils.prototype.logTypes = function(types) {
	var i = 0;
	R.map(function(item) {
		var m = R.map(function(j){
			return R.length(item['modules' + j] || '')
		}, R.range(1,5))
		console.log('types' + i++ + ':'+ m.join(','));
	}, types)
}

LogUtils.getArticle = function(articles) {
	R.forEach(function(item) {
		console.log(item.message);
		var art = item.article;
		var content = '';
		for(var i = 1; i <= 4; i++) {
			R.forEach(function(ite) {
				content += ite.content;
			}, art['modules' + i]);
		}
		//		console.log(content);
	}, articles);
}

module.exports = LogUtils;