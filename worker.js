var async = require('asyncawait/async');
var await = require('asyncawait/await');
var config = require('./config/config');
var log = require('./utilities/logger');
var request = require('co-request');
var _ = require('lodash');
var redis = require('./redis/connection');
var jackrabbit = require('jackrabbit');
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
		log.error({jobStatus: 'FAILED', response: response});
		return response;
	}
});



async (function () {
	await (redis.init());
	var rabbit = jackrabbit('amqp://guest:guest@127.0.0.1:5672/')
		.on('connected', function () {
			log.info('RabbitMQ connected');
		})
		.on('error', function (err) {
			log.error('RabbitMQ ' + err);
		})
		.on('disconnected', function () {
			log.error('RabbitMQ disconnected');
		});

	var exchange = rabbit.default();
	var rpc = exchange.queue({name: 'rpcQueue', prefetch: 1, durable: false});

	rpc.consume(async (function (message, reply) {
		var response = await (handleMessage(message));
		reply(response);
	}));

})();

