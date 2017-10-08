var ExcelUtils = require('../utils/ExcelUtils');
var DBUtils = require('../utils/DBUtils');
var CrudUtil = require('../utils/CrudUtil')
var BosonNLP = require('../lib/Bosonnlp');
var Constant = require('../modules/Constant');
var LogUtils = require('../modules/LogUtils');
var R = require('ramda');

var LOG = new LogUtils();
var nlp = new BosonNLP(Constant.NNSP_KEY);

var datas = ExcelUtils.importDatas('../files/datas/datas170925.xlsx');

//DBUtils.createDatas(datas);
var all = 0;

var getTags = function(datas) {
	console.log(datas.length)
	var nlptag = sleep(100);
	R.map(function(item) {
		R.map(function(i) {
			var modules = item['modules' + i];
			if(modules && modules.length > 0) {
				all++;
				nlptag = nlptag.then(nlptagPromise(modules));
			}
		}, R.range(1, 5));
	}, datas);
	nlptag.then(sleep(2000)).then(function(){
		var data = CrudUtil.getUpsertData(datas);
		R.forEach(function(item) {
			DBUtils.updateDatas(item.query, item.update)
		}, data);
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