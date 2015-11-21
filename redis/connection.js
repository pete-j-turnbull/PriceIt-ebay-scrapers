var log = require('../utilities/logger');
var config = require('../config/config');

var wrapper = require('co-redis');

var redisClient = require('redis').createClient(config.redis.port, 
	config.redis.host);
var redisCo = wrapper(redisClient);

module.exports = redisCo;
