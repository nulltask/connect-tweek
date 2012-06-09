
/*!
 * connect-tweek
 * Copyright(c) 2012 Seiya Konno <nulltask@gmail.com>
 *
 * @license MIT.
 */

/**
 * Module dependencies.
 */

var connect = require('connect')
  , mime = connect.mime
  , EventEmitter = require('events').EventEmitter
  , proto = require('./middleware.js')
  , utils = connect.utils
  , pkg = require('../package');

/**
 * Expose middleware factory.
 */

module.exports = createMiddleware;

/**
 * Module version.
 */

exports.version = pkg.version;

/**
 * Proxy middleware.
 *
 * @param {Object} options
 * @return {Function}
 */

function createMiddleware() {
  var middleware = function() {
    for (var i = 0, len = arguments.length; i < len; ++i) {
      middleware.use(arguments[i]);
    }
  };
  
  utils.merge(middleware, proto);
  utils.merge(middleware, EventEmitter.prototype);
  
  Object.keys(mime.types).forEach(function(ext) {
    middleware.__defineGetter__(ext, function() {
      this._types.push(ext);
      return this;
    });
  });

  if (1 === arguments.length) {
    middleware.options = arguments[0];
  } else if (arguments.length > 1) {
    for (var i = 0, len = arguments.length; i < len; ++i) {
      middleware.use(arguments[i]);
    }
  }
  
  return middleware;
};
