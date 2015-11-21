var async = require('asyncawait/async');
var await = require('asyncawait/await');
var config = require('./config/config');
var log = require('./utilities/logger');
var _ = require('lodash');
var redis = require('./redis/connection');
var zerorpc = require('zerorpc');



var handleMessage = async (function (message) {
	try {
		log.info({jobStatus: 'RECEIVED', request: message});

		// Check that redis doesn't contain a result already
		//var page = await (getPage(message.apiKey, ota, otaName));

		//var response = _(page).extend({success: true}).value();
		// log.info({jobStatus: 'PROCESSED', response: response});
		var response = null;
		return response;

	} catch (err) {
		var response = {success: false, message: String(err.stack)};
		log.error({jobStatus: 'FAILED', response: response});
		return response;
	}
});



var server = new zerorpc.Server({

	getProfile: async (function(apiKey, ota, reply) {
		var response = await (handleMessage({apiKey: apiKey}));
		log.info(response);
		reply(null, response);
	})

});
server.bind(config.zerorpc.bind);

