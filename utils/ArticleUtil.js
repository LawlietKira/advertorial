var R = require('ramda');
var Constant = require('../modules/Constant');
var LogUtils = require('../modules/LogUtils');
var FileUtils = require('./FileUtils');

var ArticleUtil = function() {}
var PARAGRAPH = ['<p>', '</p>'];
var COMPANY_MODULE = Constant.COMPANY_MODULE;
var REG = {
	type7title: '%titleX%', //陈述标题不取这类
}
var ALL_DATA = [], //所有的模板数据
	PUBLIC_DATA = {}, //通用的模板数据
	TYPE7_DATA = '', //不加问号的标题
	TYPE7_USE = false,
	TRADE_TYPE = {}; // 行业模板
var article_matched = [];

var LOG = new LogUtils();
var message = '';
/**
 * 根据
 * ['','']标题
 * 行业
 * 计算文章
 * 
 */
ArticleUtil.prototype.createArticles = function(data, importTitle) {
	TRADE_TYPE = {};
	ALL_DATA = data;
	PUBLIC_DATA = data[0]; //取第一个
//	LOG.log(ALL_DATA.length, 'asdasdas')
	TYPE7_DATA = getType7Data(data);
	//	LOG.log(ALL_DATA.length,'ALL_DATA')
	//公司
	var company = importTitle.company;
	//行业
	var trade = importTitle.trade;
	//此公司的所有标题
	var titles = importTitle.titles;
	//网址
	var url = importTitle.url;

	console.log(company, trade, titles, url)
	console.log('-----------------------')
	//找出行业
	getTradeType(trade)

	//	LOG.log(ALL_DATA.length,'ALL_DATA')
	var article_message = new FileUtils('../article/' + company + '-message.txt');
	var matched = R.isNil(TRADE_TYPE.title) ? '未匹配' : '已匹配';
	article_message.appendData(`公司名:${company},所属行业:${trade||'无'}(${matched})`);
	article_message.nextHeadLine();
	var articles = R.map(function(item) {
		//		LOG.log(importTitle,'importTitle')
		var title = formatTitle(item);
		//		LOG.log(title, 'title');
		//当前标题
		message = `标题:${title};`;
		//		LOG.log(message)
		//当前标题匹配的标题数
		var types = getTypes(title, trade);
		//		TODO articleMatches(types);
		//		LOG.log(types.length, 'types.length');

		//根据这个标题数创建文章
		var article = createArticle(types);
		//		LOG.log(article.message, 'message');
		article_message.appendData(article.message);
		//设置待导入的数据
		setArticleDetails(article_message, importTitle, title);
		article_message.nextLine();
		return analysisArticle(article, title, url, trade, company);
	}, titles);
	article_message.write();
	return articles;
}

var getType7Data = function(data) {
	var data7 = data.find(function(item) {
		return item.type.indexOf('7') !== -1;
	});
	//	LOG.log(data7.keys, 'type7的数据');
	return R.compose(R.replace(/[X]+/g, '.*?'), R.join('|'))(data7.keys);
}

//设置导入文章模板
var setArticleDetails = function(file_message, importTitle, title) {
	var article_details = {
		title: title,
		site: importTitle.site,
		custid: importTitle.custid,
		projectid: importTitle.projectid
	}
	file_message.nextLittleLine();
	file_message.appendData(JSON.stringify(article_details));
}

/**
 * 将标题格式化
 * 将英文问号转成中文问号，在末尾添加问号
 * @param {Object} title
 */
var formatTitle = function(title) {
	if(R.test(new RegExp(TYPE7_DATA), title)) {
		TYPE7_USE = true;
		return R.compose(
			R.replace(/[\.。]?$/, '。'),
			R.replace(/ /g, ''),
			R.replace(/\./g, '。')
		)(title);
	} else {
		TYPE7_USE = false;
		return R.compose(
			R.replace(/[？]?$/, '？'),
			R.replace(/ /g, ''),
			R.replace(/\?/g, '？')
		)(title);
	}
}

/**
 * 获取行业的模板，并从types中剔除
 * @param {Object} types
 */
var getTradeType = function(trade) {
	var tradeTypes = [];
	for(var i = ALL_DATA.length - 1; i >= 0; i--) {
		if(ALL_DATA[i].type[0] === '5') {
//			var tradeType = ALL_DATA.splice(i, 1)[0];
			var tradeType = ALL_DATA[i];
			if(R.test(new RegExp(R.join('|', tradeType.keys)))(trade)) {
				TRADE_TYPE = tradeType;
			}
		}
	}
	//	LOG.log(TRADE_TYPE, 'TRADE_TYPE');
}

var appendParagraph = function(content) {
	return R.join(content, PARAGRAPH);
}
/**
 * 解析成能使用的文章
 * @param {Object} article
 */
var analysisArticle = function(article, title, url, trade, company) {
	var content = '';
	if(article.success) {
		var artic = article.article;
		var randomSite = getTitlesSite(artic);
		for(var i = 1; i <= 4; i++) {
			var art = artic['modules' + i];
			var spec = '';
			var tempContent = '';
			R.forEach(function(item) {
				if(!item){
					console.log('........2'+item)
				}
				tempContent += item.content;
			}, art);

			if(R.contains(i, randomSite)) {
				tempContent = title + tempContent;
			}
			if(i === 1) {
				spec = Constant.URL_GET_FREE_DATA;
			} else if(i === 2) {
				spec = Constant.URL_DETAIL;
			}
			tempContent += spec;
			content += appendParagraph(tempContent);
		}
	} else {
		return article.message;
	}
	while(R.test(/XYX/, content)) {
//		console.log('content',content)
		content = R.replace(/XYX/, COMPANY_MODULE[getRandonNum(COMPANY_MODULE.length)], content)
	}
	content = R.compose(
		R.replace(/\?/g, '？'), //将所有英文?转换成中文？
		R.replace(/\\r\\n/g, '</p><p>'), //替换换行符
		R.replace(/%br%/g, '</p><p>'), //替换换行符
		R.replace(/[（\(]?%titleX?%[）\)]?/g, title), //替换模板标题
		R.replace(/%url%/g, url), //替换公司网址
		R.replace(/XX|xx/g, trade), //替换行业
		R.replace(/XXX|xxx/g, company) //替换公司名
	)(content)
	return content;
}

/**
 * 生成标题随机放的位置
 * @param {Object} artic
 * return {Array}
 */
var getTitlesSite = function(artic) {
	var titlesSite = [];
	var randomSite = [];
	for(var i = 1; i <= 4; i++) {
		var art = artic['modules' + i];
		var tempContent = '';
		R.forEach(function(item) {
			if(!item){
				console.log('........'+item)
			}
			tempContent += item.content;
		}, art);
		if(R.contains('%title%', tempContent)) {
			titlesSite.push(i)
		}
	}
	while(titlesSite.length < 2) {
		var num = getRandonNum(4) + 1;
		if(!R.contains(num, titlesSite)) {
			titlesSite.push(num);
			randomSite.push(num);
		}
	}
	return randomSite;
}

/**
 * 根据title找出所有types
 * @param {Object} titles
 */
var getTypes = function(title, trade) {
	//	var types = R.clone(ALL_DATA);
	var types = ALL_DATA;
	//选出1-2种类型，如：天合光能“代理条件？”天合光能“加盟热线多少?”
	var usedTypes = R.filter(function(item) {
		//类型6， 标题+行业的类型
		if(R.contains('6', item.type)){
			item.isUse = false;
			if(item.isUse && trade) {
				TRADE_TYPE = {}
				console.log('trade', trade)
				item.isUse = R.contains(trade, item.trade);
			}
		}
		return item.isUse;
	}, R.map(function(item) {
		item.isUse = R.test(
			new RegExp(R.compose(
				R.replace(/xxx|XXX|xx|XX/g, '[\\u4e00-\\u9fa5\\w]+'), 
				R.join('|')
			)(item.keys))
		)(title)
		if(item.type[0] === '7' || item.type[0] === '5'){
			item.isUse = false;
		}
		return item;
	})(types));

//	LOG.log(usedTypes)
	var titles = [];
	R.forEach(function(item) {
		titles.push(item.title);
	}, usedTypes);
	message += `匹配到${titles.length}个标题：${JSON.stringify(titles)};`;
	return usedTypes;
}

/**
 * 对每个标题进行创建文章
 * @param {Object} types
 * return 
 * 	{
 * 		success:true,
 * 		message:'',失败时的信息
 * 		article:{
 * 			modules1:[{}],
 * 			...
 * 		}
 * 	}
 */
var createArticle = function(types) {
	var len = types.length;
	var success = false,
		article = {};
	//	LOG.log(len, 'len')
	if(len === 0) {
		success = false;
		message += '该标题没匹配到模板';
	} else if(len === 1) {
		success = true;
		//		article = createArticleBy1(types[0]);
		article = createArticleBy2(types);
	} else if(len === 2) {
		success = true;
		article = createArticleBy2(types);
	} else if(len === 3) {
		success = true;
		article = createArticleBy3(types);
	} else {
		return {
			success: false,
			message: message + `该标题没匹配异常，匹配到${len}个`
		}
	}
	return {
		success: success,
		message: message,
		article: article
	};
}

/**
 * 根据传入的一个type进行创建文章，
 * 如果不穿type，使用默认模板创建文章
 * @param {Object} types 被匹配到的模板
 */
var createArticleBy0 = function(types) {
	if(!types) {
		types = PUBLIC_DATA;
	}
	return createArticleByTypes([types, types, types, types]);
}

/**
 * types.length == 4
 * 
 * @param {Object} types
 */
var createArticleByTypes = function(types) {
	return {
		modules1: getContent(1, types[0]),
		modules2: getContent(2, types[1]),
		modules3: getContent(3, types[2]),
		modules4: getContent(4, types[3])
	}
}

/**
 * 当只匹配到1个type时，创建文章
 * @param {Object} types 被匹配到的模板
 */
var createArticleBy1 = function(types) {
	//先生成初始文章
	var article = createArticleBy0(types);
	//根据文章找出所有插入位置,此时文章
	var inserts = findInsert(article);
//	LOG.log(inserts, 'inserts')
	for(var i = 0; i < inserts.length; i++) {
		var ins = inserts[i];
		//不存在时，表示此段没有，插入一个
		if(!ins) {
			pushNotInsertData(i + 1, article, PUBLIC_DATA, types.id)
		} else {
			//存在type===1时，表示此段有插空，插入一个
			if(ins.type === '1') {
				pushNotInsertData(i + 1, article, PUBLIC_DATA, types.id);
			}
		}
	}
	return article;
}

/**
 * 当匹配到2个type时，创建文章
 * @param {Object} types 被匹配到的模板
 */
var createArticleBy2 = function(types) {
	var article = {};
	//如果行业模板不为空，添加到types中
	//匹配到3个，不取行业；匹配到2个，取0-1个行业；匹配到1个，取0-2个行业
	if(R.length(types) < 3 && !R.equals(TRADE_TYPE, {})) {
		//使行业取到的概率为50%
		R.forEach(function(i) {
			types.push(TRADE_TYPE)
		}, R.range(0, getRandonNum(4 - R.length(types))))
	}
	var sequency = getTypesSequence(types);
//	LOG.log(sequency, 'sequency')
	var sequencyIds = []
	sequency.forEach(function(item) {
		sequencyIds.push(item.id)
	})
//	LOG.log(sequencyIds,'sequencyIds')
	var article = createArticleByTypes(sequency)

	return insertSpace(article, types, sequencyIds);
}

/**
 * 当匹配到3个type时，创建文章
 * @param {Object} types 被匹配到的模板
 */
var createArticleBy3 = function(types) {
	return createArticleBy2(types);
}

/**
 * 给生成的文章插空
 * 
 * @param {Object} article
 * @param {Object} types
 */
var insertSpace = function(article, types, sequencyIds) {
	//根据文章找出所有插入位置,此时文章
	var inserts = findInsert(article);
	//	LOG.log(inserts)

	for(var i = 0; i < inserts.length; i++) {
		var ins = inserts[i];
		//不存在时，表示此段没有，插入一个
		if(!ins) {
			pushNotInsertData(i + 1, article, types, sequencyIds[i])
		} else {
			//存在type===1时，表示此段有插空，插入一个
			if(ins.type === '1') {
				pushNotInsertData(i + 1, article, types, sequencyIds[i]);
			}
		}
	}
	return article;
}

/**
 * 根据模板提前生成段落顺序
 * 为2-3个模板时
 * 
 * @param {[Object]} types
 */
var getTypesSequence = function(types) {
	//type==2,1段优先；
	var types1 = getTypesByType(types, '2');
	if(types1.length > 0) {
		types1 = getRandomTypes(types1);
	}
	//type==3,3段优先；type==4,3、4段优先
	var types3 = getTypesByType(types, '4');
	if(types3.length === 0) {
		types3 = getTypesByType(types, '3');
	}
	if(types3.length > 0) {
		types3 = getRandomTypes(types3);
		if(R.contains('4', types3.type)) {
			types4 = types3;
		} else {
			types4 = getRandomTypes(types);
		}
	} else {
		types3 = getRandomTypes(types);
		types4 = getRandomTypes(types);
	}
	if(types1.length === 0) {
		types1 = getNoUseTypes(types, [types3, types4]);
	}
	//第2段没有优先级；
	var types2 = getNoUseTypes(types, [types1, types3, types4]);
	return [types1, types2, types3, types4];
}

/**
 * 获取没有使用到的types
 * @param {Object} types
 * @param {Object} uses
 */
var getNoUseTypes = function(types, uses) {
	var use = R.map(function(item) {
		return item.id;
	}, uses);
	var nouse = [];
	types.forEach(function(item) {
		var id = item.id;
		if(!R.contains(id, use)) {
			nouse.push(item);
		}
	});
	if(nouse.length > 0) {
		return getRandomTypes(nouse);
	} else {
		return getRandomTypes(types);
	}
}

/**
 * 从模板中随机取一个
 * @param {Object} types
 * return {Object}
 */
var getRandomTypes = function(types) {
	return types[getRandonNum(types.length)];
}

/**
 * 根据段落数，确定待使用的模板
 * 
 * @param {Object} types
 * @param {String} type
 */
var getTypesByType = function(types, type) {
	var res = []
	types.forEach(function(item) {
		if(R.contains(type, item.type)) {
			res.push(item);
		}
	});
	return res;
}

/**
 * @param {Object} types
 * @param {String} num 0-6
 * 
 * 如果没匹配到返回 通用型‘0’ 
 */
var findType = function(types, num) {
	for(var i = 0; i < types.length; i++) {
		if(types[i].type === num) {
			return String(i);
		}
	}
	return '0';
}

/**
 * 给文章的第num段添加一个段落
 * 
 * @param {Number} num 第几段
 * @param {Object} article 当前文章
 * @param {Object} types 从哪选
 */
var pushNotInsertData = function(num, article, types, currentId) {
	var useType = types;
	if(types instanceof Array) {
		types.forEach(function(item) {
			if(item.id !== currentId) {
				useType = item;
				return;
			}
		});
	}
	//	LOG.log(article,'pushNotInsertData')
	article['modules' + num].push(getNotInsertContent(num, useType, article));
}

/**
 * 根据模板，选取的段落，生成套话
 * @param {Number} content 从模板中选取的段落
 * @param {Object} type 模板
 */
var getContent = function(contents, type) {
	var modules = PUBLIC_DATA['modules' + contents];
//	console.log('contents.......satrt'+contents)
	//行业模板已放入type
	if(type['modules' + contents] && type['modules' + contents].length > 0) {
		modules = type['modules' + contents]
	}
//	console.log('type..............'+JSON.stringify(type))
//	if(modules.length === 0){
//		console.log('modules........'+JSON.stringify(modules))
//	}
//	console.log('contents.......end'+contents)
	//如果是陈述句标题，则选取没%titleX%的数据
	return getType7Titles(modules);
}

//如果是陈述句标题，则选取没%titleX%的数据
var getType7Titles = function(modules) {
	var index = getRandonNum(modules.length);
	if(TYPE7_USE) {
		//	TODO while	LOG.log('开始获取type7非titleX数据')
//		if(!modules[index]){
//			console.log('........3'+JSON.stringify(modules))
//		}
		if(R.contains(REG.type7title, modules[index].content)) {
			index = getRandonNum(modules.length);
		}
	}
	return modules.splice(index, 1);
}

/**
 * 根据模板，选取非插空段落，生成套话
 * @param {Number} content 从模板中选取的段落
 * @param {Object} type 模板
 */
var getNotInsertContent = function(contents, type) {
	var modules = type['modules' + contents] || [];
	var index = 10;
	var result = '';
//	LOG.log('开始插空')
	while(index > 0 && modules.length > 0) {
		//随机生成一个数
		var ran = getRandonNum(modules.length);
		//如果这个数所在的段落不是插空的，则取出来
		if(modules[ran].type !== '1') {
			result = modules.splice(ran, 1)[0];
//			LOG.log('插空成功')
			break;
		}
		index--;
	}
	if(result === '') {
		modules = PUBLIC_DATA['modules' + contents] || [];
		var ran = getRandonNum(modules.length);
		if(modules[ran].type !== '1') {
			result = modules.splice(ran, 1)[0];
		}
	}
	return result;
}

/**
 * 生成随机数
 * @param {Number} num
 */
var getRandonNum = function(num) {
	return Math.floor(Math.random() * num);
}

/**
 * 找出这篇文章所有insert类型所在的段落
 * @param {Object} articles
 */
var findInsert = function(articles) {
	var result = [];
	for(var i = 1; i <= 4; i++) {
		var m = articles['modules' + i];
		// 如果有1个数据，取它的类型
		if(m.length === 1) {
			result[i - 1] = {
				id: articles.id,
				type: m[0].type
			};
		} else if(m.length === 2) {
			// 如果有2个数据，默认非插空
			result[i - 1] = {
				id: articles.id,
				type: '0'
			};
		}
		// 如果有没有数据，为undefined
	}
	return result;
}

var articleMatches = function(types) {
	R.forEach(function(item) {

	}, R.range(0, R.length(types)));
}

module.exports = ArticleUtil;