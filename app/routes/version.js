const router = require('koa-router')();
const config = require('../config/config');

router.get('/', async function(ctx, next) {
  ctx.status = 200;
  ctx.body = config.version;
});

module.exports = router;
