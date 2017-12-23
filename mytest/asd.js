var fs = require('fs');

var getFileName = function(name) {
	var d = new Date().toLocaleDateString().replace(/[\\\-]/g,'') + 'T';
	name = name.replace(/(?=\.xlsx)/, '-' + d)
	var p = new Promise(function(resolve, reject) {
		var index = 1;
		var isExists = function(name) {
			fs.exists(name, function(exists) {
				console.log(name)
				if(true) {
					index++;
					name = name.replace(/\-?[\d]*(?=\.xlsx)/, '-' + index);
					isExists(name);
				} else {
					resolve(name);
				}
			});
		}
		isExists(name);
	})
	return p;
}
getFileName('金花小雨.xlsx')