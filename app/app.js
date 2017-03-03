const Koa = require('koa');
const Pug = require('koa-pug');
const serve = require('koa-static');
const router = require('koa-router')();
const convert = require('koa-convert');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const debug = require('debug');
const error = debug('app:error');
const moment = require('moment');
const config = require('./config/config');
const loggerhelper = require('./middleware/loggerhelper');

const app = new Koa();

// routes
var index = require('./routes/index');
var login = require('./routes/login');
const version = require('./routes/version');

// middlewares
app.use(serve('.'));
app.use(convert(bodyparser()));
app.use(convert(json()));
app.use(convert(logger()));

new Pug({
  app: app,
  basedir: __dirname + '/views/layouts',
  viewPath: __dirname + '/views',
  locals: {
    config: config,
    moment: moment
  },
  noCache: false
});

// 404
app.use(async (ctx, next) => {
  await next();
  if (ctx.response.status == 404) {
    await ctx.render('404');
  }
});

// router
router.use('/', index.routes(), index.allowedMethods());
router.use('/login', login.routes(), login.allowedMethods());
router.use('/version', version.routes(), version.allowedMethods());
app.use(router.routes(), router.allowedMethods());

// response
app.on('error', function (err, ctx) {
  console.log(err);
  loggerhelper.debug(err);
  error(err);
});

module.exports = app;
