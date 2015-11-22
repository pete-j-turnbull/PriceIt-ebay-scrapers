var async = require('asyncawait/async');
var await = require('asyncawait/await');
var config = require('./config/config');
var log = require('./utilities/logger');
var request = require('co-request');
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

var getSuggestions = async (function (params) {
	var searchTerm = params.searchTerm;
	var result = await (request('http://autosug.ebaystatic.com/autosug?kwd=' + searchTerm + '&sId=3'));
	var suggestions = JSON.parse(result.body.match('({.*})')[0]).res.sug;
	var response = {suggestions: suggestions}
	return response;
});


var handleMessage = async (function (message) {
	try {
		log.info({jobStatus: 'RECEIVED', request: message});

		var response;

		if (message.action == 'getFeatures') {
			var params = message.params;
			response = {result: null};
		} else if (message.action == 'getPrices') {
			var params = message.params;
			response = {result: null};
		} else if (message.action == 'autoSuggest') {
			var params = message.params;
			response = await (getSuggestions(params));
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
		reply(null, response);
	})
});
server.bind(config.zerorpc.bind);

