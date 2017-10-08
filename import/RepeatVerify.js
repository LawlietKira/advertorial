var DBUtils = require('../utils/DBUtils');
var ExcelUtils = require('../utils/ExcelUtils');
var LogUtils = require('../modules/LogUtils');
var FileUtils = require('../utils/FileUtils');
var R = require('ramda');

var LOG = new LogUtils();

/**
 * 完全匹配查重方式的前期数据准备
 * @param {Object} data
 */
var getDatasAllMatchKey = function(data) {
	return R.reduce(function(pre, cur) {
		R.forEach(function(index) {
			var modules = cur['modules' + index] || [];
			R.forEach(function(item) {
				var content = item.content;
				if(pre[content]) {
					pre[content].titles.push(cur.title);
				} else {
					pre[content] = { titles: [cur.title] ,matchs:[]}
				}
			}, modules); //['modules','modules']
		}, R.range(1, 5));
		return pre;
	}, {}, data)
}

/**
 * 完全匹配方式的查重
 * @param {Object} cur_data 当前数据
 * @param {Object} datas 数据库
 */
var VerifyAllMatchData = function(cur_data, datas) {
	return R.reduce(function(pre, cur) {
		R.forEach(function(index) {
			var modules = cur['modules' + index] || [];
			R.forEach(function(item) {
				var content = item.content;
				if(pre[content]) {
					if(pre[content].matchs) {
						pre[content].matchs.push(cur.title);
					} else {
						pre[content].matchs = [cur.title];
					}
				}
			}, modules); //['modules','modules']
		}, R.range(1, 5));
		return pre;
	}, cur_data, datas);
}

/**
 * 完全匹配的查重信息输出
 * @param {Object} result
 */
var analysisAllMatchResult = function(result) {
	var fileUtile = new FileUtils('../import/allMatchRepeat.txt');
	R.mapObjIndexed(function(value, key, obj) {
		if(value.titles.length > 1 || value.matchs.length > 0) {
			fileUtile.appendData(key);
			if(value.titles.length > 1){
				fileUtile.appendData('\r\n当前数据重复标题：')
				fileUtile.appendData(JSON.stringify(value.titles));
			}
			if(value.matchs.length > 0){
				fileUtile.appendData('\r\n数据库中重复标题：')
				fileUtile.appendData(JSON.stringify(value.matchs));
			}
			fileUtile.appendData('\r\n')
			fileUtile.nextHeadLine();
		}
	}, result);
	fileUtile.write();
}

DBUtils.getDatasPromise().then(function(data) {
	//当前待比较的数据
	var current_data = ExcelUtils.importDatas('../files/datas/datasTest.xlsx');
	//	LOG.log(current_data)
	//把当前数据重复校验
	var match_data = getDatasAllMatchKey(current_data);
	//	LOG.log(match_data)
	//	LOG.log(data)
	var match_result = VerifyAllMatchData(match_data, data);
//	LOG.log(match_result)
	
	analysisAllMatchResult(match_result)
});