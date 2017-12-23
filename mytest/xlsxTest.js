var xlsx = require('node-xlsx');

var a = xlsx.parse('G:/gitspace/advertorial/files/titles/titles171217.xlsx');

console.log(JSON.stringify(a))
