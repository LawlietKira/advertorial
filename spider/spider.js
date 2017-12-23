var http = require('http');
var fs = require('fs');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var request = require('request');
//var url = "http://zhejiang.3158.cn/info/20171024/n52714101493590.html";
var url = "http://zhejiang.3158.cn/info/20171111/n53585101499831.html";

var getContent = function($){
	var $content = $('.text','.art-con');
	$content.find('a[target!="_blank"]').remove();
	return $content.text().trim();
}

var getBrand = function($){
	return $('.jiameng-txt').children().first().find('a').text().trim()
}
request({
    url: url,
    gzip: true
}, function(err, response, body) {
    var $ = cheerio.load(body); //采用cheerio模块解析html
	var news_item = {
		//获取文章的标题
		title: $('h2').first().text().trim(),
		//品牌
		brand : getBrand($),
		//获取当前文章的内容
		content: getContent($),
		
	};
	console.log(news_item)
});

