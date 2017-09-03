var MongoClient = require("mongodb").MongoClient;
var CommonUtil = require('./CommonUtil');
var DB_CONN_URL = 'mongodb://localhost:27017/advertorial';
var MongoUtil = function() {}
var getIndex = CommonUtil.getIndex(1);
var connect = function(dbUrl, dbHandle, errorBack) {
	var index = getIndex();
	MongoClient.connect(dbUrl, function(err, db) {
		if(!err) {
			console.log(`连接成功！-----${index}`);
			//关闭连接，以及日志记录 
			//TODO 日志记录以后再做
			dbHandle(db, function(req, result) {
				req = req||{},result = result||{};
				console.log(`url=${req.originalUrl}`)
//				console.log(`res=${JSON.stringify(result)}`)
				console.log(`断开连接！-----${index}`);
				db.close();
			})
		} else {
			console.log(`连接失败！-----${index}`);
			if(typeof errorBack === 'function') {
				errorBack();
			}
		}
	});
}

MongoUtil.connect = function(dbHandle, errorBack) {
	connect(DB_CONN_URL, dbHandle, errorBack);
};
MongoUtil.connectUrl = function(dbUrl, dbHandle, errorBack) {
	connect(dbUrl, dbHandle, errorBack);
}
module.exports = MongoUtil;