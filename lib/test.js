var BosonNLP = require('./Bosonnlp');
var Constant = require('../modules/Constant');


var nlp = new BosonNLP(Constant.NNSP_KEY);

var text = "XXX是非常赚钱的，XXX在国内有着巨大的影响力，\r\n有很好的信誉度与知名度，其推广力度使得品牌知名度不断上升，开启了新的一片天空，赢得了大家的支持，也实实在在让代理加盟商获得了巨大的利益，是加盟商致富的法宝。如果你对这个项目有兴趣，请点击后面的留言链接进行咨询。";
nlp.tag([text,text], function (data) {
	console.log(JSON.parse(data));
});
