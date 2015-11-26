var async = require('asyncawait/async');
var await = require('asyncawait/await');
var config = require('./config/config');
var log = require('./utilities/logger');
var request = require('co-request');
var _ = require('lodash');
var cheerio = require('cheerio');
var redis = require('./redis/connection');
var zerorpc = require('zerorpc');
var scrape = require('./scrape');
var getPrices = require('./getPrices').getPrices;
var getFeatures = require('./getFeatures').getFeatures;
var getSuggestions = require('./getSuggestions').getSuggestions;


var handleMessage = async (function (message) {
	try {
		log.info({jobStatus: 'RECEIVED', request: message});

		var result;

		if (message.action == 'getFeatures') {
			var params = message.params;
			result = await (getFeatures(params));
		} else if (message.action == 'getPrices') {
			var params = message.params;
			result = await (getPrices(params));
		} else if (message.action == 'autoSuggest') {
			var params = message.params;
			result = await (getSuggestions(params));
		}

		var response = {result: result, success: true};
		log.info({jobStatus: 'PROCESSED', response: response});
		return response;

	} catch (err) {
		var response = {success: false, result: String(err.stack)};
		log.info({jobStatus: 'FAILED', response: response});
		return response;
	}
});




var server = new zerorpc.Server({
	job: async (function(message, reply) {
		var response = await (handleMessage(message));
		reply(null, JSON.stringify(response));
	})
});
server.connect('tcp://127.0.0.1:4244');

