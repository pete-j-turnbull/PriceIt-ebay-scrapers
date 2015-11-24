var async = require('asyncawait/async');
var await = require('asyncawait/await');
var request = require('co-request');
var log = require('./utilities/logger');
var _ = require('lodash');
var scrape = require('./scrape');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var redis = require('./redis/connection');

var handleSpecialFeatures = function(featureName) {
	var specialFeatureNames = ['Condition']; specialLabels = ['LH_ItemCondition'];
	var sIndex = specialFeatureNames.indexOf(featureName);
	if (sIndex == -1) {
		return featureName;
	}
	return specialLabels[sIndex];
};
var constructFeaturesUrl = function (searchTerm) {
	var searchTermString = encodeURIComponent(searchTerm).replace('%20', '+');
	return 'http://www.ebay.co.uk/sch/i.html?LH_Auction=1&_nkw=' + searchTermString + '&LH_PrefLoc=1&LH_Complete=1&LH_Sold=1';
};
var constructOptionsUrl = function (searchTerm, featureName) {
	featureName = handleSpecialFeatures(featureName);
	var searchTermString = encodeURIComponent(searchTerm).replace('%20', '+');
	var featureNameString = encodeURIComponent(featureName).replace('%20', '%2520');

	return 'http://www.ebay.co.uk/sch/i.html?_nkw=' + searchTermString + '&_ssan=' + featureNameString;
};

var _getOptions = async (function (searchTerm, featureName) {
	var html = await (scrape.scrape(constructOptionsUrl(searchTerm, featureName)));
	var options = _(JSON.parse(html).values)
		.map(function (opt) { return {title: opt.title, count: opt.count}; })
		.sort((o1, o2) => o2.count - o1.count)
		.value();
	return options;
});

var _getFeatures = async (function (params) {
	var searchTerm = params.searchTerm;
	var html = await (scrape.scrape(constructFeaturesUrl(searchTerm)));
	var $ = cheerio.load(html);

	//Feature names
	var featureNames = _($("span[class='pnl-h']"))
		.map(item => _.trim($(item).text()))
		.without('Format', 'Seller', 'Item location', 'Delivery options', 'Show only', 'Price', 'Language')
		.value();
	//Option lists
	var optionLists = await (Promise.map(featureNames, fName => _getOptions(searchTerm, fName)));

	//Score features
	var featureScores = [];
	optionLists.forEach(function (optList) {
		// Use this to work out if a feature is of any use...

		var notSpecifiedCount = 0;
		var totalCount = 0;
		optList.forEach(function (opt) {
			if (opt.title === 'Not specified') {
				notSpecifiedCount = opt.count;
			}
			totalCount += opt.count;
		});
		var score = notSpecifiedCount == 0 ? 1 : (totalCount - notSpecifiedCount) / totalCount;
		featureScores.push(score);
	});

	//Remove 'Not specified' from optionLists
	optionLists = _(optionLists)
		.map(function(optList) {
			nOptList = [];
			optList.forEach(function(opt) {
				if (opt.title != 'Not specified') {
					nOptList.push(opt);
				}
			});
			return nOptList.slice(0, 4);
		})
		.value();


	// Create features object
	var features = [];
	for (i = 0; i < featureNames.length; i++) {
		var optList = _(optionLists[i])
			.map(opt => opt.title)
			.value();
		features.push({name: featureNames[i], options: optList, score: featureScores[i]});
	}
	features = features.sort((f1, f2) => f2.score - f1.score);
	log.debug(features);

	featuresObj = {};
	features.slice(0, 8).forEach(function(feature) {
		var key = feature.name;
		var opts = feature.options;
		featuresObj[key] = {options: opts};
	});
	return {features: featuresObj};
});


module.exports.getFeatures = async (function (params) {
	// Run a request to eBay with the correct searchItem
	// Pull out features and choose only popular ones
	// return a list of features with choices available

	// Cache features permanently 
	var cacheKey = 'features.' + params.searchTerm;
	var features = await (redis.get(cacheKey));
	if (features != null) {
		// Cached result
		return JSON.parse(features);
	} else {
		var features = await (_getFeatures(params));
		await (redis.set(cacheKey, JSON.stringify(features)));
		return features;
	}
	return await (_getFeatures(params))
});

