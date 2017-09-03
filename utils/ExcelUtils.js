var R = require('ramda');
var xlsx = require("node-xlsx");
var ExcelUtils = function() {};

ExcelUtils.getExcels = function(fileName) {
	//'./datas.xlsx'
	return xlsx.parse(fileName);
}

/**
 * excel数据转化成待导入数据库的格式
 */
ExcelUtils.importDatas = function(fileName) {
	var list = ExcelUtils.getExcels(fileName);
	var index = 0;
	return R.map(function(item) {
		//每一页sheet的内容
		var datas = R.prop('data', item);
		return R.reduce(function(pre, cur) {
			var k = String(cur[0]);
			var v = String(cur[1]);
			if(!k || !v || k === 'undefined' || v === 'undefined'){
				return pre;
			}
			if(k === 'title' || k === 'details') {
				pre[k] = v;
			} else if(k === 'type'){
				pre[k] = v.split(',');
				console.log(k,v)
			}else if(k === 'keys') { //keys
				pre[k] = pre[k] || [];
				pre[k].push(v);
			} else { //modules1-4
				pre[k] = pre[k] || [];
				if(R.indexOf('%insert%', v) > -1) {
					pre[k].push({
						type: '1',
						content: R.replace('%insert%','',v)
					})
				} else {
					pre[k].push({
						type: '0',
						content: v
					})
				}
			}
			return pre;
		}, {id:index++}, datas);
	}, list);

}

module.exports = ExcelUtils;