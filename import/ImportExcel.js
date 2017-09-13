var xlsx = require("node-xlsx");
var ExcelUtils = require('../utils/ExcelUtils');
var DBUtils = require('../utils/DBUtils');

var datas = ExcelUtils.importDatas('datas170913.xlsx');
//console.log(JSON.stringify(datas));

DBUtils.createDatas(datas);
