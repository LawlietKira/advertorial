var http = require('http');
var fs = require('fs');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var request = require('request');
var xlsx = require('node-xlsx');
var FileUtils = require('../utils/FileUtils');
var R = require('ramda');
var Constant = require('../modules/Constant');
var COMPANY_MODULE = Constant.COMPANY_MODULE;
var baseUrl = 'C:\\Users\\Administrator\\Desktop\\';
//var url = 'http://www.3158.cn/xiangmu/409786/';
//var url = 'http://www.3158.cn/xiangmu/174898/xmjs.html';
var name = process.argv[2] || 'titles.xlsx';
console.log(name);
if(!name) {
	console.log('文件名有误');
	return
}
var a = xlsx.parse(name);
var getContent = function($, url) {
	var $content = $('.all-itm-info').find('dd li')
	if($content.length === 0) {
		$content = $('.detailinfo').find('li');
	}
	return {
		url: url,
		company: $content.eq(0).text().trim().replace(/.*?[:：]/, ''),
		trade: $content.eq(1).text().trim().replace(/.*?[:： ]/, ''),
		content: $('.xm_baidu').find('.txt').text().replace(/[ 　]/g, '').replace(/[\n]+/g,'\n\n')
					.replace(new RegExp(COMPANY_MODULE.join('|'), 'g'), 'XYX')
	};
}
var getBrand = function($) {
	return $('.jiameng-txt').children().first().find('a').text().trim()
}

var memoizeQuery = R.memoize(function(url){
	return queryPromise(url);
});

var queryPromise = function(url) {
	var p = new Promise(function(resolve, reject) {
		console.log('url', url)
		request({
			url: url,
			gzip: true
		}, function(err, response, body) {
			var $ = cheerio.load(body); //采用cheerio模块解析html
			var news_item = getContent($, url);
			resolve(news_item)
		});
	});
	return p;
}
var use = [2, 3, 10, 4, 6, 7],
	times = 0;
var data = a[0].data.map(function(item, i) {
	if(i === 0) {
		return ['客户ID', '项目ID', '招商页链接', '标题', '发布站点', '发布栏目', '公司', '行业']
	} else if(item[0]) {
		var temp = [];
		use.forEach(function(usei) {
			temp.push(item[usei])
		});
		return temp;
	}
})

for(var i = 0; i < data.length; i++) {
	if(!data[i]) {
		data.splice(i);
		break;
	}
}

var dir = baseUrl + 'asd\\';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

var l = data.length,
	usedCompany = [];
data.forEach(function(item, index) {
	if(index !== 0) {
		memoizeQuery(item[2]).then(function(data) {
			if(data.company && usedCompany.indexOf(data.company) === -1){
				var files = new FileUtils(dir + data.company + '.txt');
				files.appendData(data.content);
				files.write_absolute_path();
				usedCompany.push(data.company)
			}
			item.push(data.company);
			var ls = data.trade.replace(/ /g, '').split('>')
			item.push(ls[1]);
			item.push(ls[0]);
			times++;
		}).catch(function(e) {
			times++;
			console.log(e)
		});
	} else {
		times++;
	}
});


var getFileName = function(name) {
	var d = new Date().toLocaleDateString().replace(/[\\\-]/g, '') + 'T';
	name = name.replace(/(?=\.xlsx)/, '-' + d)
	var p = new Promise(function(resolve, reject) {
		var index = 1;
		var isExists = function(name) {
			fs.exists(name, function(exists) {
				if(exists) {
					index++;
					name = name.replace(/\-?[\d]*(?=\.xlsx)/, '-' + index);
					isExists(name);
				} else {
					console.log('path', name)
					resolve(name);
				}
			});
		}
		isExists(name);
	})
	return p;
};
var wait = function(fileName) {
	if(times !== data.length) {
		console.log('wait', times, l)
		setTimeout(function() {
			wait(fileName)
		}, 100);
	} else {
		console.log('解析完成');
		var buffer = xlsx.build([{
			name: 'sheet1',
			data: data
		}]);
		fs.writeFileSync(fileName, buffer, { 'flag': 'w' });
	}
}
getFileName(name).then(function(fileName) {
	console.log('开始生成excel', fileName)
	wait(fileName)
})

//console.log(JSON.stringify(data))