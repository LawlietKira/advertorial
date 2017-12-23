var http = require('http');
var fs = require('fs');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var request = require('request');

var SpiderUtiles = function() {};


SpiderUtiles.getPageList = function() {
	var url = "http://zhejiang.3158.cn/info/zheyangchihe/";
	var p = new Promise(function(resolve, reject) {
		request({
			url: url,
			gzip: true
		}, function(err, response, body) {
			if(!err && response.statusCode == 200) {
				var $ = cheerio.load(body); //采用cheerio模块解析html
				var $list_t = $('.list_t.clearfix');
				var news_items = [];
				var i = 0;
				$list_t.find('dl').each(function(i, item) {
					var $head = $(item).find('.fr');
					news_items.push({
						id:$head.attr('href').match(/(n[\d]+)\.html/)[1],
						title: $head.attr('title'),
						url: $head.attr('href')
					})
				})
//				console.log(news_items);
				resolve(news_items)
			} else {
				console.log(err);
				reject(err)
			}
		});
	});
	return p;
}

module.exports = SpiderUtiles;