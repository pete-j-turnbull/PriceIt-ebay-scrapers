var async = require('asyncawait/async');
var await = require('asyncawait/await');
var request = require('co-request');
var log = require('./utilities/logger');
var _ = require('lodash');
var scrape = require('./scrape');
var cheerio = require('cheerio');

var constructUrl = function(searchTerm) {
	return 'http://autosug.ebaystatic.com/autosug?kwd=' + searchTerm + '&sId=3';
};

module.exports.getSuggestions = async (function (params) {
	var searchTerm = params.searchTerm;

	var html = await (scrape.scrape(constructUrl(searchTerm)));

	var suggestions = JSON.parse(html.match('({.*})')[0]).res.sug;
	var response = {suggestions: suggestions}
	return response;
});