var async = require('asyncawait/async');
var await = require('asyncawait/await');
var log = require('./utilities/logger');
var _ = require('lodash');
var request = require('co-request');


module.exports.scrape = async (function (url) {

	var options = {
		url: url,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'
		}
	};

	var result = await (request(options));
	var body = result.body;
	return body;
});