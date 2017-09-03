var fs = require('fs'),
	path = require('path');
	

var FileUtils = function(name) {
	this.fileName = name;
	this.data = '';
};

FileUtils.prototype.appendData = function(data){
	this.data += data;
}

FileUtils.prototype.nextLine = function(){
	this.data += '\r\n----------\r\n';
}

FileUtils.prototype.nextHeadLine = function(){
	this.data += '\r\n====================\r\n';
}

FileUtils.prototype.write = function() {
	var w_data = new Buffer(this.data);

	fs.writeFile(__dirname + '/' + this.fileName, w_data,  {flag: 'a', encoding: 'utf8'}, function(err) {
		if(err) {
			console.error(err);
		} else {
			console.log('写入成功');
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
