var ArticleUtil = require('./ArticleUtil');
var MongoUtil = require('./MongoUtil');
var LogUtils = require('../modules/LogUtils');
var FileUtils = require('./FileUtils');
var ExcelUtils = require('./ExcelUtils');
var Constant = require('../modules/Constant');
var PictureUtil = require('./PictureUtil')
var fs = require("fs");
var path = require("path");

var R = require('ramda');
var LOG = new LogUtils();
var RESULT = [];
var dataIndex = 0;

var cleanArticleDir = function(dir) {
	var files = []; //判断给定的路径是否存在  
	if(fs.existsSync(dir)) { //返回文件和子目录的数组    
		files = fs.readdirSync(dir);
		files.forEach(function(file, index) { // 
			var curPath = dir + "/" + file;
			var curPath = path.join(dir, file); //fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数     
			if(fs.statSync(curPath).isDirectory()) { 
				deleteFolderRecursive(curPath);    
			} else {
				fs.unlinkSync(curPath);
			}
		}); 
	} else {
		console.log("给定的路径不存在，请给出正确的路径");
	}
	console.log('删除成功')
}

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
	R.forEach(function(item) {
		//		LOG.log(JSON.stringify(item))
		LOG.log(`第${i++}篇标题..${item.company}`)
		createArticleByTitle(item, item.company, result)
	}, allTitles);
});

//下载图片
function getAllImgs(allTitles){
	allTitles.forEach(function(item){
		PictureUtil.getAllImgs(item.url, item.projectid,item.company)
	})
}

(function() {
	//	var datas = R.tail(ExcelUtils.getExcels('../files/titles/titles180224.xlsx')[0].data);
	//先清空article文件夹
	cleanArticleDir('../article')
	var datas = R.tail(ExcelUtils.getExcels('../files/titles/金花小雨.xlsx')[0].data);
	var allTitles = R.reduce(function(pre, cur) {
		var title = R.last(pre);
		//[客户ID,项目ID,招商页链接,标题,发布站点,发布栏目,公司,行业]
		if(!title || title.id !== String(cur[1])) {
			pre.push({
				id: String(cur[1]),
				custid: String(cur[0]), //客户id
				projectid: String(cur[1]), //项目id
				site: cur[4], //发布站点
				titles: [cur[3]],
				url: cur[2],
				company: cur[6],
				trade: cur[7]
			});
		} else {
			title.titles.push(cur[3]);
		}
		return pre;
	}, [], datas)
//		LOG.log(allTitles,'allTitles');
	//	allTitles = R.filter(function(item){
	//		return R.contains(item.id, ['226270'])
	//	}, allTitles);
	//下载图片
	getAllImgs(allTitles)
	
	if(Constant.USE_DIF) {
		LOG.log('所有标题使用不同数据')
		getCreatePromise().then(createAllDif(allTitles)).catch(function(errorMessage) {
			LOG.log(`文章创建异常，请联系开发人员！${errorMessage}`, 'error')
		});
	} else {
		var titles = R.forEach(function(item, i) {
			LOG.log(`第${i}篇标题..${item.company}`)
			getCreatePromise().then(createArticleByTitle(item, item.company)).catch(function(errorMessage) {
				LOG.log(`文章创建异常，请联系开发人员！${JSON.stringify(item)};errorMessage=${JSON.stringify(errorMessage)}`, 'error')
			});
		}, allTitles);
	}
})();