var CommonUtil = function(){
};
//获取递增数据，从i开始
CommonUtil.getIndex = function(i){
	var index = i;
	return function(){
		return index++;
	};
};
module.exports = CommonUtil;
