const nconf = require('nconf');

nconf.env().argv();
nconf.file(__dirname + '/config.json');

var env = nconf.get('NODE_ENV');
var config = nconf.get('dev');

if (env == 'production') {
  config = nconf.get('pro');
} else if (env == 'test') {
  config = nconf.get('test');
}

module.exports = config;