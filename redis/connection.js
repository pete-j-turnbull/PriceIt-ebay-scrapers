var async = require('asyncawait/async');
var await = require('asyncawait/await');
var log = require('../utilities/logger');
var config = require('../config/config');
var wrapper = require('co-redis');
var redis = require('redis');

module.exports = (function() {

	var init = async (function () {

		this.connections = await (
			this.db_numbers.map(async (function (n) {
				var conn = wrapper(redis.createClient(config.redis.port, config.redis.host));
				await (conn.select(n));
				return conn;
			})));

	});
	var getConn = function (n) {
		var i = this.db_numbers.indexOf(n);
		if (i == -1) {
			return null;
		} else {
			return this.connections[i];
		}
	};

	return {
		db_numbers: [0],
		connections: [],
		init: init,
		getConn: getConn
	};
})();
