var async = require('asyncawait/async');
var await = require('asyncawait/await');
var request = require('co-request');
var log = require('./utilities/logger');
var _ = require('lodash');
var scrape = require('./scrape');
var cheerio = require('cheerio');

var constructUrl = function(searchTerm, features) {
	return 'http://www.ebay.co.uk/sch/i.html?LH_Auction=1&_nkw=' + searchTerm + '&LH_PrefLoc=1&LH_Complete=1&LH_Sold=1';
};

module.exports.getPrices = async (function(params) {
	var searchTerm = params.searchTerm;
	//var features = params.features;
	var features = null;

	var html = await (scrape.scrape(constructUrl(searchTerm, features)));
	var $ = cheerio.load(html);
	var priceList = _( $("li[class='lvprice prc']") )
		.map( item => parseInt( _.trim($(item).text()).slice(1) ) )
		.sort((a, b) => a - b)
		.value();

	var lIndex = Math.floor(priceList.length * 0.25) - 1;
	var mIndex = Math.floor(priceList.length * 0.5) - 1;
	var uIndex = Math.floor(priceList.length * 0.75) - 1;

	var response = {prices: {lower: priceList[lIndex], median: priceList[mIndex], upper: priceList[uIndex]}};
	return response;
});