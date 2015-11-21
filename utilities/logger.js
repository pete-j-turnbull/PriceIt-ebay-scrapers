var _debug = require("debug");

var conf = require('../config/config').logger;
_debug.enable(conf.enabled.join(","));

var debug = _debug('debug');
var info = _debug('info');
var error = _debug('error');
var warn = _debug('warn');

var self = module.exports = {
    debug: debug,
    info: info,
    warn: warn,
    error: error
};

debug('Available Loggers: ' + Object.keys(self));
Object.keys(self).forEach(function (logger) {
    debug('logger: ' + logger + ', enabled: ' + self[logger].enabled);
});
