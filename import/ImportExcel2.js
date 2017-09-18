var ExcelUtils = require('../utils/ExcelUtils');
var DBUtils = require('../utils/DBUtils');
var BosonNLP = require('../lib/Bosonnlp');
var Constant = require('../modules/Constant');
var LogUtils = require('../modules/LogUtils');
var R = require('ramda');

var LOG = new LogUtils();
var nlp = new BosonNLP(Constant.NNSP_KEY);

var datas = ExcelUtils.importDatas('datas170917.xlsx');

//DBUtils.createDatas(datas);
var all = 0;

var getTags = function(datas) {
	console.log(datas.length)
	var nlptag = sleep(100);
	R.map(function(item) {
		//		LOG.log(item.title)
		R.map(function(i) {
			var modules = item['modules' + i];
			if(modules && modules.length > 0) {
				all++;
				console.log('sleep'+all)
				nlptag = nlptag.then(nlptagPromise(modules));
			}
		}, R.range(1, 5));

	}, datas);
	nlptag.then(function(){
		DBUtils.createDatas(datas);
//		console.log(JSON.stringify(datas));
	});
};

var key = 0;
var chooseTags = R.curry(function(items, data) {
//	LOG.log(data)
	key++;
	if(data.length > 0) {
		R.forEach(function(i){
			items[i].tag = data[i].tag;
			items[i].word = data[i].word;
		},R.range(0, items.length));
	}
	console.log(`进度${key/all*100}%`)
});

function nlptagPromise(contents) {
	return async function(){
		if(contents.length>0){
			nlp.tag(getContents(contents), function(data) {
				chooseTags(contents, JSON.parse(data))
			});
		}else{
			console.log('end');
		}
		await sleep(200);
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

var getContents = function(contents) {
	var datas = R.map(function(item) {
		return item.content;
	}, contents);
	//	console.log(datas)
	return datas;
}

getTags(datas);
//console.log(JSON.stringify(datas));