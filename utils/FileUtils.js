var fs = require('fs'),
	path = require('path');

var FileUtils = function(name) {
	this.fileName = name;
	this.noMatched = 0;
	this.matched = 0;
	this.data = '';
};

FileUtils.prototype.appendData = function(data) {
	this.data += data;
}

FileUtils.prototype.nextLine = function() {
	this.data += '\r\n----------------------------------------\r\n';
}

FileUtils.prototype.nextLittleLine = function() {
	this.data += '\r\n-  -  -  -  -  -  -  -  -  -  -  -  -  -\r\n';
}

FileUtils.prototype.setNoMatchHead = function() {
	var head = `未匹配到${this.noMatched}条数据`
	this.data = head + '\r\n========================================\r\n' + this.data;
}

FileUtils.prototype.nextHeadLine = function() {
	this.data += '\r\n========================================\r\n';
}

FileUtils.prototype.addNoMatched = function() {
	this.noMatched++;
}

FileUtils.prototype.addMatched = function() {
	this.matched++;
}

var writeObj = {}

FileUtils.prototype.write = function() {
	var w_data = new Buffer(this.data),
		fileName = this.fileName,
		tempFile = fileName.substr(11).replace(/\.txt$/,'');
	fs.writeFile(__dirname + '/' + this.fileName, w_data, { flag: 'a', encoding: 'utf8' }, function(err) {
		if(err) {
			console.error(tempFile,err);
		} else {
			console.log('写入成功...', tempFile);
		}
	});
}
FileUtils.prototype.write_absolute_path = function() {
	var w_data = new Buffer(this.data),
		fileName = this.fileName,
		tempFile = fileName.substr(11).replace(/\.txt$/,'');;
	fs.writeFile(this.fileName, w_data, { flag: 'a', encoding: 'utf8' }, function(err) {
		if(err) {
			console.error(tempFile, err);
		} else {
			console.log('写入成功...', tempFile);
		}
	});
}

//var f =new FileUtils('t2.txt');
//f.appendData('asd,');
//f.appendData('dsa')
//f.appendData('vvv\r\n');
//f.nextLine();
//f.appendData('aaaaaaaaa')
//f.write();
module.exports = FileUtils;