var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var mkdirp = require('mkdirp');

var PictureUtil = function(){
	
}


function getAllImgSrc(url){
	var p = new Promise(function(resolve, reject){
			request({
		    url: url,
		    gzip: true
		}, function(err, response, body) {
			var $ = cheerio.load(body),
				src = []
			$('.subimg').find('img').each(function(i, item){
				src.push($(item).attr('src'))
			})
			resolve(src)
		});
	})
	return p;
}

var changeUrl = function(url,projectid) {
	var reg = /\/corpname\/[a-z\d]+\/$/,
		res_rul = '';
	if(reg.test(url)) {
		res_rul = url.replace(/\/corpname\/[a-z\d]+\/$/, `/xiangmu/${projectid}/xmxc.html`)
	} else {
		res_rul = url + 'xmxc.html';
	}
	return res_rul;
}

//下载图片
var downloadImg = function(url, dir, filename){
	request.head(url, function(err, res, body){
		if(err){
			console.log(err)
			console.error(`${url} 下载失败`)
		}else{
			request(url).pipe(fs.createWriteStream(dir + "/" + filename));
		}
	});
};

PictureUtil.getAllImgs = function(url, projectid,company){
	var change_url = changeUrl(url, projectid);
	getAllImgSrc(change_url).then(function(src){
		//本地存储目录
		var dir = '../article/images';
		//创建目录
		mkdirp(dir, function(err) {
			if(err){
				console.log(err);
			}
			src.forEach(function(item, i){
				downloadImg(`http:${item}`, dir, `${company}_${i+1}.jpg`)
			})
		});
	})
}

module.exports = PictureUtil;