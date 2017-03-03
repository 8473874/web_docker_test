var router = require('koa-router')();

router.get('/', async function (ctx, next) {
  console.log("login");

  var callback = ctx.request.query["callback"] || ctx.request.query["function"];
  console.log(callback);
  var data = {
    status : 200,
    msg: "ok"
  };
  if (!callback) return
  ctx.response.type = 'text/html;charset=utf-8'
  startChunk = callback + '('
  endChunk = ')'
  ctx.response.body = startChunk +JSON.stringify(data) + endChunk;
});

module.exports = router;