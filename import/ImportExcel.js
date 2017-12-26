var ExcelUtils = require('../utils/ExcelUtils');
var DBUtils = require('../utils/DBUtils');
var Constant = require('../modules/Constant');

var datas = ExcelUtils.importDatas('../files/datas/datas171225.xlsx');
console.log(JSON.stringify(datas));
//
DBUtils.deleteDatasPromise().then(function(data){
	DBUtils.createDatas(datas);
});


