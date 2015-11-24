var zerorpc = require('zerorpc');
var config = require('./config/config');
var log = require('./utilities/logger');

var client = new zerorpc.Client();
client.connect(config.zerorpc.connect);

client.invoke('job', {action: 'getFeatures', params: {searchTerm: 'iPhone'}}, function(e, response, more) {
	log.info(JSON.parse(response));
});
