var http = require('http');
var fs = require('fs');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var request = require('request');

var url = 'http://www.3158.cn/xiangmu/417545/';
var url2 = 'http://www.3158.cn/corpname/tefulai/';
//var url = 'http://www.3158.cn/xiangmu/409786/';
var getContent = function($) {
	var $content = $('.all-itm-info,.slideBoxCls').find('dd li')
	if($content.length === 0) {
		$content = $('.detailinfo').find('li');
	}
	return {
		content: $content.eq(0).text().trim(),
		trade: $content.eq(1).text().trim()
	};
}

var getBrand = function($) {
	return $('.jiameng-txt').children().first().find('a').text().trim()
}

/**
 * url:http://www.3158.cn/xiangmu/174898/xmjs.html
 */
var getUrlContent = function() {
	request({
		url: url,
		gzip: true
	}, function(err, response, body) {
		var $ = cheerio.load(body); //采用cheerio模块解析html
		var news_item = getContent($);
		console.log(news_item)
	});
}
getUrlContent()

var getContent2 = function(){
	request({
		url: url2,
		gzip: true
	}, function(err, response, body) {
		var $ = cheerio.load(body); //采用cheerio模块解析html
		console.log($('.subnav li').eq(1).find('a').first().attr('href'))
	});
}