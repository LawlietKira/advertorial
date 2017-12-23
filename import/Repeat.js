var xlsx = require("node-xlsx");
var ExcelUtils = require('../utils/ExcelUtils');
var LogUtils = require('../modules/LogUtils');
var R = require('ramda');
var FileUtils = require('../utils/FileUtils');

var LOG = new LogUtils();
var datas = ExcelUtils.importDatas('../files/datas/datas171024.xlsx');
//LOG.log(datas)
//var m = R.reduce(function(pre, cur) {
//	return R.reduce(function(p1, index) {
//		var modules = cur['modules' + index] || [];
//		return R.reduce(function(p2, c2) {
//			if(R.prop(c2, p2)) {
//				p2[c2].titles = p2[c2].titles || [];
//				p2[c2].titles.push(modules.title);
//			}
//			return p2;
//		}, p1, modules); //['modules','modules']
//	}, pre, R.range(1, 4)); //[1,2,3,4]
//}, {}, datas) //[{id,title,detail,type,keys,modules1}]


var m = R.reduce(function(pre, cur) {
	R.forEach(function(index){
		var modules = cur['modules' + index] || [];
		R.forEach(function(item) {
			var content = item.content;
			if(pre[content]) {
				pre[content].titles.push(cur.title);
			}else{
				pre[content] = {titles:[cur.title]}
			}
		}, modules); //['modules','modules']
	}, R.range(1, 5));
	return pre;
}, {}, datas) //[{id,title,detail,type,keys,modules1}]
//LOG.log(m)

var fileUtile = new FileUtils('../import/repeat.txt');
R.mapObjIndexed(function(value, key, obj){
	if(value.titles.length > 1){
		fileUtile.appendData(key);
		fileUtile.appendData('\r\n')
		fileUtile.appendData(JSON.stringify(value.titles));
		fileUtile.nextHeadLine();
	}
}, m);
fileUtile.write();