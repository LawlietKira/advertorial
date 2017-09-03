var MongoUtil = require('./MongoUtil');
var ExcelUtils = require('./ExcelUtils');
var R = require('ramda');
var DBUtils = function() {};

DBUtils.createDatas = function(datas) {
	console.log(JSON.stringify(datas));
	MongoUtil.connect(function(db, callback) {
		var collection = db.collection('advert');
		collection.save(getSaveData(datas), function(err, result) {
			if(err) {
				console.log('Error:' + err);
				return;
			}
//			console.log('result=' + result);
			callback();
		});
	}, function() {
		console.log('error')
	});
}

var getSaveData = function(datas) {
	return R.set(R.lensProp('types'), datas, { trade: 'public' });
}

DBUtils.getDatas = function() {
	var data = []
	MongoUtil.connect(function(db, callback) {
		var collection = db.collection('test');
		collection.find({ trade: 'public' }).toArray(function(err, result) {
			if(err) {
				console.log('Error:' + err);
				return;
			}
			data = result;
			callback();
		});
	}, function() {
		console.log('error')
	});
	return data;
}
module.exports = DBUtils;