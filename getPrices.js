var async = require('asyncawait/async');
var await = require('asyncawait/await');
var request = require('co-request');
var log = require('./utilities/logger');
var _ = require('lodash');
var scrape = require('./scrape');
var cheerio = require('cheerio');
var redis = require('./redis/connection');

var handleSpecialFeatures = function(featureName) {
	var specialFeatureNames = ['Condition']; specialLabels = ['LH_ItemCondition'];
	var sIndex = specialFeatureNames.indexOf(featureName);
	if (sIndex == -1) {
		return featureName;
	}
	return specialLabels[sIndex];
};
var constructUrl = function(searchTerm, features) {
	var searchTermString = encodeURIComponent(searchTerm).replace('%20', '+');

	var featureParamStrings = _(Object.keys(features))
		.map(function(featureName) {
			var featureNameString = encodeURIComponent(handleSpecialFeatures(featureName)).replace('%20', '%2520');
			var optionChoiceString = encodeURIComponent(features[featureName]).replace('%20', '%2520');

			return featureNameString + '=' + optionChoiceString;
		})
		.value();

	var allFeaturesParamString = _(featureParamStrings)
		.reduce((total, s) => total + '&' + s);

	return 'http://www.ebay.co.uk/sch/i.html?LH_Auction=1&_nkw=' + searchTermString + '&LH_PrefLoc=1&LH_Complete=1&LH_Sold=1' + allFeaturesParamString;
};

var _getPrices = async (function(params) {
	var searchTerm = params.searchTerm;
	var features = params.features;

	var html = await (scrape.scrape(constructUrl(searchTerm, features)));
	var $ = cheerio.load(html);
	var priceList = _( $("li[class='lvprice prc']") )
		.map( item => parseInt( _.trim($(item).text()).slice(1) ) )
		.sort((a, b) => a - b)
		.value();

	var lIndex = Math.floor(priceList.length * 0.2) - 1;
	var mIndex = Math.floor(priceList.length * 0.5) - 1;
	var uIndex = Math.floor(priceList.length * 0.8) - 1;

	var response = {prices: {lower: priceList[lIndex], median: priceList[mIndex], upper: priceList[uIndex]}};
	return response;
});

module.exports.getPrices = async (function(params) {
	var cacheKey = 'prices.' + params.searchTerm + JSON.stringify(params.features);
	var prices = await (redis.get(cacheKey));
	if (prices != null) {
		return JSON.parse(prices);
	} else {
		var prices = await (_getPrices(params));
		await (redis.set(cacheKey, JSON.stringify(prices)));
		return prices;
	}
});