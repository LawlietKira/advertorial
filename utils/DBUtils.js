var MongoUtil = require('./MongoUtil');
var ExcelUtils = require('./ExcelUtils');
var Constant = require('../modules/Constant');
var R = require('ramda');
var DBUtils = function() {};

DBUtils.createDatas = function(datas) {
	console.log(JSON.stringify(datas));
	MongoUtil.connect(function(db, callback) {
		var collection = db.collection(Constant.ADVERTORIAL_DATA);
		insertFun(collection, datas, callback);
	}, function() {
		console.log('error')
	});
}

DBUtils.updateDatas = function(whereStr, updateStr){
	MongoUtil.connect(function(db, callback) {
		var collection = db.collection(Constant.ADVERTORIAL_DATA);
		collection.update(whereStr, updateStr, {upsert:true}, function(err, result) {
		if(err) {
			console.log('Error:' + err);
			return;
		}
		callback();
	})
	}, function() {
		console.log('error')
	});
}

var saveFun = function(collection, datas, callback){
	collection.save(getSaveData(datas), function(err, result) {
		if(err) {
			console.log('Error:' + err);
			return;
		}
		callback();
	})
}

var insertFun = function(collection, datas, callback){
	collection.insert(getSaveData2(datas), function(err, result) {
		if(err) {
			console.log('Error:' + err);
			return;
		}
		callback();
	})
}

var getSaveData = function(datas) {
	return R.set(R.lensProp('types'), datas, { trade: 'public' });
}

var getSaveData2 = function(datas) {
	return datas;
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