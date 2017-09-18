var ArticleUtil = require('./ArticleUtil');
var MongoUtil = require('./MongoUtil');
var LogUtils = require('../modules/LogUtils');
var FileUtils = require('./FileUtils');
var ExcelUtils = require('./ExcelUtils');
var LogUtils = require('../modules/LogUtils');
var Constant = require('../modules/Constant');

var R = require('ramda');
var LOG = new LogUtils();

var getCreatePromise = function() {
	var p = new Promise(function(resolve, reject) {
		MongoUtil.connect(function(db, callback) {
			var collection = db.collection(Constant.ADVERTORIAL_DATA);
			collection.find({}).toArray(function(err, result) {
				if(err) {
					console.log('Error:' + err);
					return;
				}
				//解析数据
				resolve(result);
				callback();
			});
		}, function() {
			console.log('error')
			reject();
		});
	});
	return p;
}
var createArticleByTitle = R.curry(function(company, titles, trade, result) {
//	var ariticles = ArticleUtil.createArticles(result[0], titles, trade, company);
	var ariticle = new ArticleUtil();
	var ariticles = ariticle.createArticles(result, titles, trade, company);
	var fileUtile = new FileUtils('../article/' + company + '-Articles.txt');
	R.forEach(function(item) {
		fileUtile.appendData(`字数为 ${item.length}\r\n`)
		fileUtile.appendData(item);
		fileUtile.nextLine();
	}, ariticles)
	fileUtile.write();
});

(function(){
	var datas = R.tail(ExcelUtils.getExcels('./titles170917.xlsx')[0].data);
	var allTitles = R.reduce(function(pre, cur){
		var title = R.last(pre);
		//[客户ID,项目ID,招商页链接,标题,发布站点,发布栏目,公司,行业]
		if(!title || title.id !== String(cur[1])){
			pre.push({
				id : String(cur[1]),
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
	LOG.log(allTitles,'allTitles');
	var titles = R.forEach(function(item){
		var title = R.map(function(t){
			return {
				title : t,
				url : item.url
			}
		}, item.titles);
//		LOG.log(title)
		getCreatePromise().then(createArticleByTitle(item.company, title, item.trade)).catch(function(){
			LOG.log('文章创建异常，请联系开发人员','error')
		});
	}, allTitles);
})();
