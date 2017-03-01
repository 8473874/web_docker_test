const request = require('request');
const logger = require('./loggerhelper');

const requesthelper = {
  request: function (params, callback) {
    var beginDate = new Date();
    var timeLog = {
      beginDate: beginDate.toLocaleDateString() + ' ' + beginDate.toLocaleTimeString(),
      beginTime: beginDate.getTime(),
      endDate: '',
      endTime: '',
      executionTime: '',
      elapsedTime: '',
      params: params
    };
    var baseRequest = request.defaults({
      time: true,
      json: true
    });
    var requestObj = baseRequest(params, function (error, response, result) {
      if (error) {
        var errorInfo = {
          params: params,
          error: error
        };
        logger.error(errorInfo);
      } else {
        var endDate = new Date();
        timeLog.endTime = endDate.getTime(); //结束时间
        timeLog.endDate = endDate.toLocaleDateString() + ' ' + endDate.toLocaleTimeString(); //结束时间
        timeLog.executionTime = timeLog.endTime - timeLog.beginTime;
        timeLog.elapsedTime = response.elapsedTime ? response.elapsedTime : '';
        if (timeLog.elapsedTime >= 500 || timeLog.executionTime >= 500) {
          logger.warn(timeLog);
        } else {
          logger.debug(timeLog);
        }
      }
      callback(error, response, result);
    });

    return requestObj;
  }
};

module.exports = requesthelper;