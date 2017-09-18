var ExcelUtils = require('../utils/ExcelUtils');
var DBUtils = require('../utils/DBUtils');
var Constant = require('../modules/Constant');


var datas = ExcelUtils.importDatas('datas170918.xlsx');
console.log(JSON.stringify(datas));

DBUtils.createDatas(datas);




