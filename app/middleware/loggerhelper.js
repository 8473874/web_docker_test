const log4js = require('log4js');
const fs = require('fs');
const path = require('path');
const log4config = require('../config/log4config');

const loggerhelper = {
  objConfig: {},
  logDebug: null,
  logInfo: null,
  logWarn: null,
  logErr: null,
  clearDate: '',
  // 判断日志目录是否存在，不存在时创建日志目录    
  checkAndCreateDir: async function(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  },
  // 清理过期日志
  clearOldLog: async function() {
    var nowDate = new Date().toDateString();
    if(nowDate == this.clearDate){
      return;
    }
    this.clearDate = nowDate;
    console.log("最后执行清理日志的日期：" + this.clearDate);

    let objConfig = this.objConfig;
    if (!objConfig || !objConfig.appenders) {
      return;
    }

    let baseDir = objConfig['customBaseDir'];
    let defaultAtt = objConfig['customDefaultAtt'];

    // 轮询所有日志配置
    for (let i = 0, j = objConfig.appenders.length; i < j; i++) {
      let item = objConfig.appenders[i];
      if (item['type'] == 'console')
        continue;

      if (defaultAtt != null) {
        for (let att in defaultAtt) {
          if (item[att] == null)
            item[att] = defaultAtt[att];
        }
      }
      if (baseDir != null) {
        if (item['filename'] == null)
          item['filename'] = baseDir;
        else
          item['filename'] = baseDir + item['filename'];
      }
      let fileName = item['filename'];
      if (fileName == null)
        continue;
      let pattern = item['pattern'];
      if (pattern != null) {
        fileName += pattern;
      }
      let category = item['category'];
      if (!path.isAbsolute(fileName)) {
        fileName = path.resolve(fileName);
      }
      // console.log("fileName:" + fileName);
      let basePath = path.resolve('');
      let dir = path.dirname(fileName);
      // console.log("dir:" + dir);
      let relative = path.relative(basePath, dir);
      // console.log("relative:" + relative);

      try {
        var files = fs.readdirSync(relative);
        // console.log(files);

        if (!files || !files.length) {
          continue;
        }

        for(var fi=0,fl=files.length;fi<fl;fi++){
          var file = files[fi];
          if (file.indexOf('.log') < 0) {
            continue;
          }

          var filePath = relative + "/" + file;
          filePath = path.resolve(filePath);
          try {
            // console.log("filePath:"+filePath);
            var stat = fs.statSync(filePath);
            var mTime = new Date(stat.mtime);
            var nowTime = new Date();
            var tempTimes = nowTime.getTime() - mTime.getTime() //时间差的毫秒数
            var days = Math.floor(tempTimes / (24 * 3600 * 1000));
            // console.log('days:' + days);
            // 删除超过N天的日志
            if (days > 30) {
              try {
                if (fs.existsSync(filePath)) {
                  fs.unlink(filePath);
                  console.log('成功删除文件:' + filePath);
                }
              } catch (e) {
                console.log("fs.unlink:" + e);
              }
            }
          } catch (err) {
            console.log("fs.statSync:" + err);
          }
        }

      } catch (e) {
        console.log("fs.readdirSync error:" + err);
      }
    }

    // console.log("清理完成：" + this.isClearing);
  },
  init: async function() {
    console.log("loggerhelper.init");
    // // 加载配置文件
    // this.objConfig = JSON.parse(fs.readFileSync('log4js.json', 'utf8'));
    // let objConfig = this.objConfig;
    let objConfig = log4config;

    // 检查配置文件所需的目录是否存在，不存在时创建  
    if (objConfig && objConfig.appenders) {
      let baseDir = objConfig['customBaseDir'];
      let defaultAtt = objConfig['customDefaultAtt'];

      for (let i = 0, j = objConfig.appenders.length; i < j; i++) {
        let item = objConfig.appenders[i];
        if (item['type'] == 'console')
          continue;

        if (defaultAtt != null) {
          for (let att in defaultAtt) {
            if (item[att] == null)
              item[att] = defaultAtt[att];
          }
        }
        if (baseDir != null) {
          if (item['filename'] == null)
            item['filename'] = baseDir;
          else
            item['filename'] = baseDir + item['filename'];
        }
        let fileName = item['filename'];
        if (fileName == null)
          continue;
        let pattern = item['pattern'];
        if (pattern != null) {
          fileName += pattern;
        }
        let category = item['category'];
        if (!path.isAbsolute(fileName)) {
          fileName = path.resolve(fileName);
        }
        let basePath = path.resolve('');
        let dir = path.dirname(fileName);
        let relative = path.relative(basePath, dir);
        let dirList = relative.split(path.sep);
        for (let i = 0, j = dirList.length; i < j; i++) {
          let dirPath = ''
          for (let d = 0; d <= i; d++) {
            dirPath += dirList[d] + '/';
          }
          dirPath = path.resolve(dirPath);
          this.checkAndCreateDir(dirPath);
        }
      }
    }

    // 目录创建完毕，才加载配置，不然会出异常  
    log4js.configure(objConfig);

    this.logDebug = log4js.getLogger('debugs');
    this.logInfo = log4js.getLogger('infos') || log4js.getLogger();
    this.logWarn = log4js.getLogger('warns');
    this.logErr = log4js.getLogger('errors');

    this.clearOldLog();
  },
  trace: async function(msg) {
    if (this.logInfo) {
      this.logInfo.trace(msg);
    }
    this.clearOldLog();
  },
  debug: async function(msg) {
    if (this.logInfo) {
      this.logInfo.debug(msg);
    }
    if (this.logDebug) {
      this.logDebug.debug(msg);
    }
    this.clearOldLog();
  },
  info: async function(msg) {
    if (this.logInfo) {
      this.logInfo.info(msg);
    }
    this.clearOldLog();
  },
  warn: async function(msg) {
    if (this.logInfo) {
      this.logInfo.warn(msg);
    }
    if (this.logWarn) {
      this.logWarn.warn(msg);
    }
    this.clearOldLog();
  },
  error: async function(msg) {
    if (this.logInfo) {
      this.logInfo.error(msg);
    }
    if (this.logErr) {
      this.logErr.error(msg);
    }
    this.clearOldLog();
  },
  fatal: async function(msg) {
    if (this.logInfo) {
      this.logInfo.fatal(msg);
    }
    this.clearOldLog();
  }
};
loggerhelper.init();

module.exports = loggerhelper;
