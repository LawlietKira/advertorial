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
var name = process.argv[2] || '任务分配.xlsx';
console.log(name);
if(!name) {
	console.log('文件名有误');
	return;
}
var a = xlsx.parse(name);
var getContent = function($, url) {
	var $content = $('.all-itm-info,.slideBoxCls').find('dd li')
	if($content.length === 0) {
		$content = $('.detailinfo').find('li');
	}
	return {
		url: url,
		company: $content.eq(0).text().trim().replace(/.*?[:：]/, ''),
		trade: $content.eq(1).text().trim().replace(/.*?[:： ]/, ''),
		content: getByContent($)
	};
}
var getByContent = function($) {
	var text = '';
	var $box = $('#tabbox2,.intro-content'),
		$templ = $('.temp-l');
	if($('.xm_baidu').find('.txt').length > 0) {
		text = $('.xm_baidu').find('.txt').text()
	} else if($box.length > 0) {
		var head = $box.find('.hd li');
		var body = $box.find('.bd ul,.bd div');
		head.each(function(i, item) {
			text = text + $(item).text() + '\r\n' + body.eq(i).text() + '\r\n--------------------\r\n';
		})
//		console.log(head.length, body.length, text)
	} else if($templ.length > 0) {
		$templ.find('.bg-white').each(function(i, item) {
			text = text + $(item).find('.temp-title').text() + '\r\n'
					+ $(item).find('.txt').text() + '\r\n--------------------\r\n';
		})
	}
	return text.replace(/[\n]+/g, '\n\n').replace(/[ 　]/g, '')
		.replace(new RegExp(COMPANY_MODULE.join('|'), 'g'), 'XYX')
}

var getBrand = function($) {
	return $('.jiameng-txt').children().first().find('a').text().trim()
}

var memoizeQuery = R.memoize(function(url) {
	return queryPromise(url);
});

var queryPromise = function(url) {
	var p = new Promise(function(resolve, reject) {
		request({
			url: url,
			gzip: true,
			timeout:10000
		}, function(err, response, body) {
			if(!err){
				var $ = cheerio.load(body); //采用cheerio模块解析html
				var news_item = getContent($, url);
				resolve(news_item)
			}else{
				console.error(`请求地址失败:	${url}`)
				resolve('')
			}
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
if(!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}

/**
 * 将此类url		http://www.3158.cn/corpname/tefulai/
 * 转换为		http://www.3158.cn/xiangmu/12764/xmjs.html
 */
var excelData;
var changeUrl = function(data) {
	excelData = R.clone(data);
	var reg = /\/corpname\/[a-z\d]+\/$/;
	data.forEach(function(item, index) {
		var url = item[2];
		if(reg.test(url)) {
			item[2] = url.replace(/\/corpname\/[a-z\d]+\/$/, `/xiangmu/${item[1]}/xmjs.html`)
		} else {
			item[2] = url + 'xmjs.html';
		}
	})
//	console.log(data.map(d=>{
//		return d[2]
//	}))
	console.log(data)
}

var l = data.length,
	usedCompany = [];
var getHtmlInfo = function() {
	data.forEach(function(item, index) {
		if(index !== 0) {
			memoizeQuery(item[2]).then(function(data) {
				if(data.company && usedCompany.indexOf(data.company) === -1) {
					var files = new FileUtils(dir + data.company + '.txt');
					files.appendData('品牌名称：');
					files.appendData(data.company);
					files.appendData('\r\n');
					files.appendData('所属行业：');
					files.appendData(data.trade);
					files.nextLine();
					files.appendData(data.content);
					files.write_absolute_path();
					usedCompany.push(data.company)
				}
				excelData[index].push(data.company);
				var ls = data.trade.replace(/ /g, '').split('>')
				excelData[index].push(ls[1]);
				excelData[index].push(ls[0]);
				times++;
			}).catch(function(e) {
				times++;
				console.log(e)
			});
		} else {
			times++;
		}
	});
}

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
	if(times !== excelData.length) {
		console.log('wait', times, l)
		setTimeout(function() {
			wait(fileName)
		}, 1000);
	} else {
		console.log('解析完成');
		var buffer = xlsx.build([{
			name: 'sheet1',
			data: excelData
		}]);
		fs.writeFileSync(fileName, buffer, { 'flag': 'w' });
	}
}

var start = function() {
	changeUrl(data);
	getHtmlInfo();
	getFileName(name).then(function(fileName) {
		console.log('开始生成excel', fileName)
		wait(fileName)
	})
}
start()
//console.log(JSON.stringify(data))