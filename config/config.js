var env  = (process.env.ENV || 'development'),
    conf = require('./' + env);

conf.envName = env;

module.exports = conf;