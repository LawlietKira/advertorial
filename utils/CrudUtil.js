var DBUtils = require('../utils/DBUtils');
var MathUtil = require('../utils/MathUtil')
var ExcelUtils = require('../utils/ExcelUtils');
var LogUtils = require('../modules/LogUtils');
var R = require('ramda')

var CrudUtil = function() {};

var LOG = new LogUtils();

var getForeach = function(data) {
	return { '$each': data };
}

CrudUtil.getUpsertData = function(datas) {
	return R.map(function(item) {
		var query = {};
		var update = {};
		var addToSet = {};
		var set = {};
		query.title = item.title;
		//模板类型
		if(item.type && item.type.length > 0) {
//			addToSet.type = getForeach(item.type);
			set.type = item.type;
		}
		//标题种类
		if(item.keys && item.keys.length > 0) {
			addToSet.keys = getForeach(item.keys);
		}
		//描述
		if(item.details) {
			set.details = item.details;
		}
		R.forEach(function(i) {
			var modules = item['modules' + i];
			if(modules && modules.length > 0) {
				addToSet['modules' + i] = getForeach(modules);
			}
		}, R.range(1, 5));
		if(!R.isEmpty(addToSet)) {
			update['$addToSet'] = addToSet;
		}
		if(!R.isEmpty(set)) {
			update['$set'] = set;
		}
		return {
			query: query,
			update: update
		}
	}, datas);
}

module.exports = CrudUtil;