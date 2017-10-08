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
var createArticleByTitle = R.curry(function(title, company, result) {
	var ariticle = new ArticleUtil();
	var ariticles = ariticle.createArticles(result, title);
	LOG.log(ariticles, 'ariticles')
	var fileUtile = new FileUtils('../article/' + company + '-Articles.txt');
	R.forEach(function(item) {
		fileUtile.appendData(`字数为 ${item.length}\r\n`)
		fileUtile.appendData(item);
		fileUtile.nextLine();
	}, ariticles)
	fileUtile.write();
});

(function(){
//	var datas = R.tail(ExcelUtils.getExcels('../files/titles/testTitles.xlsx')[0].data);
	var datas = R.tail(ExcelUtils.getExcels('../files/titles/titles170930.xlsx')[0].data);
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
	allTitles = R.filter(function(item){
		return R.contains(item.id, ["19859"])
	}, allTitles);
	var titles = R.forEach(function(item){
		getCreatePromise().then(createArticleByTitle(item, item.company)).catch(function(){
			LOG.log('文章创建异常，请联系开发人员','error')
		});
	}, allTitles);
})();
