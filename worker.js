var async = require('asyncawait/async');
var await = require('asyncawait/await');
var config = require('./config/config');
var log = require('./utilities/logger');
var _ = require('lodash');
var redis = require('./redis/connection');
var zerorpc = require('zerorpc');
var scrape = require('./scrape');


var _getFeatures = async (function (params) {
	var url = '';
	var contents = scrape.scrape(url);

});
var getFeatures = async (function (params) {
	// Run a request to eBay with the correct searchItem
	// Pull out features and choose only popular ones
	// return a list of features with choices available

	// Cache features permanently
	var cacheKey = 'features.' + params.searchItem;
	var featuresItem = await (redis.get(cacheKey));
	if (featuresItem != null) {
		// Cached result
		return featuresItem;
	} else {
		return await (_getFeatures(params));
	}
});

var getPrices = async (function (params) {
	// Return 
});



var handleMessage = async (function (message) {
	try {
		log.info({jobStatus: 'RECEIVED', request: message});

		var response = null;

		if (message.action == 'getFeatures') {
			var params = message.params;
			response = {result: null};
		} else if (message.action == 'getPrices') {
			var params = message.params;
			response = {result: null};
		} else if (message.action == 'autoSuggest') {
			var params = message.params;
			response = {};
		}

		// Check that redis doesn't contain a result already
		//var page = await (getPage(message.apiKey, ota, otaName));

		response = _(response).extend({success: true}).value();
		log.info({jobStatus: 'PROCESSED', response: response});
		return response;

	} catch (err) {
		response = {success: false, result: String(err.stack)};
		log.info({jobStatus: 'FAILED', response: response});
		return response;
	}
});



var server = new zerorpc.Server({
	job: async (function(message, reply) {
		var response = await (handleMessage(message));
		log.debug(response);
		reply(null, response);
	})
});
server.bind(config.zerorpc.bind);

