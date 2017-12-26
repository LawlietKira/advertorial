var path = require('path')

var Constant = function(){
}

//Constant.ADVERTORIAL_DATA = 'test';
Constant.COMPANY_MODULE = ['这一项目', '此项目', '该品牌', '该项目', '这个项目', '这个品牌', '此品牌', '这个品牌'];
Constant.ADVERTORIAL_DATA = 'advert';
Constant.DB_CONN_URL = 'mongodb://localhost:27017/advertorial';
Constant.NNSP_KEY = 'qJ1NQkO8.17598.iyfonLSUoGXt';
Constant.ARTICLE_MAX_LENGTH = 850;
Constant.ARTICLE_MIN_LENGTH = 550;
Constant.URL_GET_FREE_DATA = '<a href="#guestbook_form"><span style="color:#9933E5;">【点击留言获取免费资料】</span></a>';
Constant.URL_DETAIL = '<a href="%url%" target="_blank"><span style="color:#E53333;"><strong>了解XXX，创业少走弯路&gt;&gt;</strong></span></a>'
Constant.USE_DIF = true;

module.exports = Constant;