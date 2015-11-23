var async = require('asyncawait/async');
var await = require('asyncawait/await');
var request = require('co-request');
var log = require('./utilities/logger');
var _ = require('lodash');
var scrape = require('./scrape');
var cheerio = require('cheerio');


var _getFeatures = async (function (params) {
	var url = '';
	var html = scrape.scrape(url);

});
module.exports.getFeatures = async (function (params) {
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