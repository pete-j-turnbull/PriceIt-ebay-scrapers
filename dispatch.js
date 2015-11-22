var zerorpc = require('zerorpc');
var config = require('./config/config');
var log = require('./utilities/logger');

var client = new zerorpc.Client();
client.connect(config.zerorpc.connect);
log.info(config.zerorpc.connect);

client.invoke('job', {action: 'getFeatures', params: {}}, function(e, response, more) {
	log.info(response.result);
});
