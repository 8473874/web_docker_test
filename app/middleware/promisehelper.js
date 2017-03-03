const logger = require('./loggerhelper');
const config = require('../config');

const promisehelper = {
  promise: function (func) {
    var promiseItem = new Promise(func);
    promiseItem.catch(function (error) {
      // 处理前一个回调函数运行时发生的错误
      logger.error(error);
    });
    return promiseItem;
  }
};

module.exports = promisehelper;