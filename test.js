var ArticleUtil = require('./utils/ArticleUtil');
var MongoUtil = require('./utils/MongoUtil');
var LogUtils = require('./modules/LogUtils');
var FileUtils = require('./utils/FileUtils');
var R = require('ramda');

//"天合光能代理怎么做？天合光能加盟费多少？", "新能源", '天合光能'
//[
//	{ title: "加盟天合光能能赚钱吗?天合光能一年能挣多少?", url: 'http://www.3158.cn/xiangmu/376280/' },
//	{ title: "天合光能怎么代理?天合光能加盟热线多少?", url: 'http://www.3158.cn/xiangmu/376280/' },
//	{ title: "天合光能代理条件都有哪些?", url: 'http://www.3158.cn/xiangmu/376280/' },
//	{ title: "怎么成为天合光能光伏发电县级代理商?", url: 'http://www.3158.cn/xiangmu/376280/' },
//	{ title: "现在做天合光能光伏发电代理商需要投资多少钱?", url: 'http://www.3158.cn/xiangmu/376280/' },
//	{ title: "开一家天合光能光伏发电需要多少钱?加盟费用多少?", url: 'http://www.3158.cn/xiangmu/376280/' },
//	{ title: "天合光能怎么代理?天合光能加盟热线多少?", url: 'http://www.3158.cn/xiangmu/376280/' }
//]
MongoUtil.connect(function(db, callback) {
	var collection = db.collection('advert');
	collection.find({ trade: 'public' }).toArray(function(err, result) {
		if(err) {
			console.log('Error:' + err);
			return;
		}
		//		console.log(JSON.stringify(result));
//		var ariticles = ArticleUtil.createArticles(result[0], [
//			{ title: "廖记棒棒鸡多久回本？半年能回本吗？", url: 'http://www.3158.cn/xiangmu/42609/' },
//			{ title: "廖记棒棒鸡利润大吗?一斤的利润有多少？", url: 'http://www.3158.cn/xiangmu/42609/' }
//		], '餐饮', '廖记棒棒鸡');
//		var ariticles = ArticleUtil.createArticles(result[0], [
//			{ title: "蒙娜丽莎箱包加盟政策好不好？加盟电话是多少？", url: 'http://www.3158.cn/xiangmu/385277/' },
//			{ title: "蒙娜丽莎箱包怎么加盟开店?", url: 'http://www.3158.cn/xiangmu/385277/' },
//			{ title: "蒙娜丽莎箱包在郑州有加盟店吗?", url: 'http://www.3158.cn/xiangmu/385277/' }
//		], '箱包', '蒙娜丽莎箱包');
//		var ariticles = ArticleUtil.createArticles(result[0], [
//			{ title: "稻草人皮具加盟费用多少钱？怎么加盟？", url: 'http://www.3158.cn/xiangmu/385277/' },
//			{ title: "稻草人皮具加盟需要多少钱？成本高吗？", url: 'http://www.3158.cn/xiangmu/385277/' },
//			{ title: "稻草人品牌皮具我想加盟怎么样？", url: 'http://www.3158.cn/xiangmu/385277/' }
//		], '箱包', '蒙娜丽莎箱包');
//		var ariticles = ArticleUtil.createArticles(result[0], [
//			{ title: "尼尔乐童车质量怎么样？价格实惠便宜吗？", url: 'http://www.3158.cn/xiangmu/374502/' },
//			{ title: "尼尔乐童车可以加盟吗？加盟多少钱？", url: 'http://www.3158.cn/xiangmu/374502/' },
//			{ title: "尼尔乐童车怎么加盟?加盟流程是什么？", url: 'http://www.3158.cn/xiangmu/374502/' },
//			{ title: "尼尔乐童车加盟投资费用多少钱？多久才能回本？", url: 'http://www.3158.cn/xiangmu/374502/' },
//			{ title: "加盟尼尔乐童车需要具备什么条件？", url: 'http://www.3158.cn/xiangmu/374502/' },
//			{ title: "开家尼尔乐童车店大概要多少钱?", url: 'http://www.3158.cn/xiangmu/374502/' },
//			{ title: "投资尼尔乐童车店利润大不大?", url: 'http://www.3158.cn/xiangmu/374502/' },
//			{ title: "尼尔乐童车加盟赚钱吗?盈利状况如何?", url: 'http://www.3158.cn/xiangmu/374502/' },
//			{ title: "怎么成为尼尔乐童车代理商?代理费是多少?", url: 'http://www.3158.cn/xiangmu/374502/' },
//			{ title: "代理尼尔乐童车市场效果怎么样?", url: 'http://www.3158.cn/xiangmu/374502/' },
//			{ title: "尼尔乐童车城镇区域怎么代理开店?", url: 'http://www.3158.cn/xiangmu/374502/' },
//			{ title: "尼尔乐童车怎么代理?有联系方式吗?", url: 'http://www.3158.cn/xiangmu/374502/' },
//			{ title: "代理尼尔乐童车有市场吗?尼尔乐童车总部加盟电话多少?", url: 'http://www.3158.cn/xiangmu/374502/' },
//			{ title: "尼尔乐童车加盟开店怎么样?可以做代理吗?", url: 'http://www.3158.cn/xiangmu/374502/' },
//		], '童车', '尼尔乐童车');
//		var title = '德威教育';
//		var ariticles = ArticleUtil.createArticles(result[0], [
//			{ title: "加盟德威教育的费用贵吗?利润空间大吗？", url: 'http://www.3158.cn/xiangmu/96036/' },
//			{ title: "办理德威教育机构需要什么手续?", url: 'http://www.3158.cn/xiangmu/96036/' },
//			{ title: "在县城开家德威教育大概要多少钱?", url: 'http://www.3158.cn/xiangmu/96036/' },
//			{ title: "开一家德威教育加盟机构的流程是什么?", url: 'http://www.3158.cn/xiangmu/96036/' },
//			{ title: "德威教育加盟赚钱吗?有没有利润？", url: 'http://www.3158.cn/xiangmu/96036/' },
//			{ title: "德威教育加盟费用是多少?加盟德威教育需要什么条件？", url: 'http://www.3158.cn/xiangmu/96036/' },
//			{ title: "德威教育可以加盟开店吗?开店多少钱？", url: 'http://www.3158.cn/xiangmu/96036/' },
//			{ title: "怎样加盟德威教育?加盟费用是多少？", url: 'http://www.3158.cn/xiangmu/96036/' },
//			{ title: "德威教育县级加盟费是多少?如何加盟?", url: 'http://www.3158.cn/xiangmu/96036/' },
//		], '教育', title);
//		var title = '嘉龙饮料';
//		var ariticles = ArticleUtil.createArticles(result[0], [
//			{ title: "嘉龙饮料店一天营业额大概能有多少?", url: 'http://www.3158.cn/xiangmu/53257/' },
//			{ title: "投资嘉龙饮料要多少成本?盈利状况如何?", url: 'http://www.3158.cn/xiangmu/53257/' },
//			{ title: "嘉龙饮料加盟店应该怎样选择店址？", url: 'http://www.3158.cn/xiangmu/53257/' },
//			{ title: "嘉龙饮料加盟流程是什么?大概要多久?", url: 'http://www.3158.cn/xiangmu/53257/' },
//		], '饮料', title);
//		var title = '春秋旅行社';
//		var ariticles = ArticleUtil.createArticles(result[0], [
//			{ title: "春秋旅行社加盟电话多少?怎么联系加盟?", url: 'http://www.3158.cn/xiangmu/229214/' },
//			{ title: "春秋旅行社加盟利润如何?一年的利润有多少?", url: 'http://www.3158.cn/xiangmu/229214/' },
//			{ title: "春秋旅行社加盟好吗?加盟春秋旅行社利润高吗?", url: 'http://www.3158.cn/xiangmu/229214/' },
//			{ title: "春秋旅行社加盟费多少?加盟需要多少钱?", url: 'http://www.3158.cn/xiangmu/229214/' },
//			{ title: "春秋旅行社可以加盟吗?加盟条件有哪些?", url: 'http://www.3158.cn/xiangmu/229214/' },
//			{ title: "春秋旅行社加盟店需要多少资金?加盟店可靠吗?", url: 'http://www.3158.cn/xiangmu/229214/' },
//			{ title: "春秋旅行社便宜吗?加盟春秋旅行社赚钱吗?", url: 'http://www.3158.cn/xiangmu/229214/' },
//		], '旅游', title);
//		var title = '喜糖铺子';
//		var ariticles = ArticleUtil.createArticles(result[0], [
//			{ title: "弄个喜糖铺子有利润吗?一年的利润大概多少?", url: 'http://www.3158.cn/xiangmu/271510/' },
//			{ title: "开喜糖铺子先到哪进货?进货价格贵吗?", url: 'http://www.3158.cn/xiangmu/271510/' },
//			{ title: "喜糖铺子加盟费多少?加盟喜糖铺子利润高吗?", url: 'http://www.3158.cn/xiangmu/271510/' },
//			{ title: "喜糖铺子连锁加盟店投资是多大?多久可以回本?", url: 'http://www.3158.cn/xiangmu/271510/' },
//			{ title: "喜糖铺子加盟电话多少?怎么联系加盟?", url: 'http://www.3158.cn/xiangmu/271510/' },
//			{ title: "开喜糖铺子货源去哪儿拿?拿货有价格优惠吗?", url: 'http://www.3158.cn/xiangmu/271510/' },
//			{ title: "喜糖铺子市场前景好吗?加盟喜糖铺子可靠吗?", url: 'http://www.3158.cn/xiangmu/271510/' },
//		], '休闲食品', title);
		var title = '德威教育';
		var ariticles = ArticleUtil.createArticles(result[0], [
			{ title: "德威教育县级加盟费是多少?如何加盟?", url: 'http://www.3158.cn/corpname/chuanhun/' },
		], '教育', title);

		
		var fileUtile = new FileUtils('../article/'+title+'-Articles.txt');

		R.forEach(function(item){
			fileUtile.appendData(`字数为 ${item.length}\r\n`)
			fileUtile.appendData(item);
			fileUtile.nextLine();
		}, ariticles)
		
		fileUtile.write();
		callback();
	});
}, function() {
	console.log('error')
});