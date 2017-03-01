const router = require('koa-router')();
const os = require('os');

router.get('/', async function (ctx, next) {
  console.log("index");
  let nowTime = new Date();
  let hostname = os.hostname();
  await ctx.render('index', {
    nowTime: nowTime,
    hostname: hostname
  });
});

module.exports = router;