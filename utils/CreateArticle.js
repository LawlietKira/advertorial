var ArticleUtil = require('./ArticleUtil');
var MongoUtil = require('./MongoUtil');
var LogUtils = require('../modules/LogUtils');
var FileUtils = require('./FileUtils');
var ExcelUtils = require('./ExcelUtils');
var Constant = require('../modules/Constant');

var R = require('ramda');
var LOG = new LogUtils();
var RESULT = [];
var dataIndex = 0;

var getCreatePromise = function() {
	var p = new Promise(function(resolve, reject) {
		MongoUtil.connect(function(db, callback) {
			var collection = db.collection(Constant.ADVERTORIAL_DATA);
			collection.find({}).toArray(function(err, result) {
				if(err) {
					console.log('Error:' + err);
					return;
				}
				LOG.log(`获取所有数据${dataIndex++}`)
				//解析数据
				resolve(result);
				callback();
			});
		}, function(errorMessage) {
			console.log('error')
			reject(errorMessage);
		});
	});
	return p;
}
var createArticleByTitle = R.curry(function(title, company, result) {
	var ariticle = new ArticleUtil();
	var ariticles = ariticle.createArticles(result, title);
//	LOG.log(ariticles, 'ariticles')
	var fileUtile = new FileUtils('../article/' + company + '-Articles.txt');
	R.forEach(function(item) {
		fileUtile.appendData(`字数为 ${item.length}\r\n`)
		fileUtile.appendData(item);
		fileUtile.nextLine();
	}, ariticles)
	fileUtile.write();
});

var createAllDif = R.curry(function(allTitles, result) {
	var i = 1;
	R.forEach(function(item){
//		LOG.log(JSON.stringify(item))
		LOG.log(`第${i++}篇标题..${item.company}`)
		createArticleByTitle(item, item.company, result)
	}, allTitles);
});

var fs = require('fs'); // 引入fs模块  
  
(function(){
//	var datas = R.tail(ExcelUtils.getExcels('../files/titles/testTitles.xlsx')[0].data);
	var datas = R.tail(ExcelUtils.getExcels('../files/titles/titles171225.xlsx')[0].data);
	var allTitles = R.reduce(function(pre, cur){
		var title = R.last(pre);
		//[客户ID,项目ID,招商页链接,标题,发布站点,发布栏目,公司,行业]
		if(!title || title.id !== String(cur[1])){
			pre.push({
				id : String(cur[1]),
				custid : String(cur[0]),//客户id
				projectid : String(cur[1]),//项目id
				site : cur[4],//发布站点
				titles : [cur[3]],
				url : cur[2],
				company : cur[6],
				trade : cur[7]
			});
		}else{
			title.titles.push(cur[3]);
		}
		return pre;
	}, [], datas)
//	LOG.log(allTitles,'allTitles');
//	allTitles = R.filter(function(item){
//		return R.contains(item.id, ['312620'])
//	}, allTitles);
	if(Constant.USE_DIF){
		LOG.log('所有标题使用不同数据')
		getCreatePromise().then(createAllDif(allTitles)).catch(function(errorMessage){
			LOG.log(`文章创建异常，请联系开发人员！${errorMessage}`,'error')
		});
	} else {
		var titles = R.forEach(function(item, i){
			LOG.log(`第${i}篇标题..${item.company}`)
			getCreatePromise().then(createArticleByTitle(item, item.company)).catch(function(errorMessage){
				LOG.log(`文章创建异常，请联系开发人员！${JSON.stringify(item)};errorMessage=${JSON.stringify(errorMessage)}`,'error')
			});
		}, allTitles);
	}
})();
