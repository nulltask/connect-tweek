
/*!
 * connect-tweek
 * Copyright(c) 2012 Seiya Konno <nulltask@gmail.com>
 *
 * @license MIT.
 */

/**
 * Module dependencies.
 */

var format = require('url').format
  , connect = require('connect')
  , request = require('request')
  , utils = connect.utils
  , pkg = require('../package');

/**
 * Expose `proxy`.
 */

module.exports = proxy;

/**
 * Module version.
 */

exports.version = pkg.version;

/**
 * Hooks.
 */

var hooks = [];

/**
 * Proxy middleware.
 *
 * @param {Object} options
 * @return {Function}
 */

function proxy(options) {
  var options = options || {}
    , suffix = options.suffix || 'localhost:3000';
  
  if (options.hooks) {
    Object.keys(options.hooks).forEach(function(host, n) {
      proxy.use(host, options.hooks[host]);
    });
  }
  
  return function proxy(req, res, next) {
    var reqOptions
      , method = req.method
      , hostname = req.headers.host
      , urlObj = {
            protocol: req.secure ? 'https' : 'http'
          , hostname: hostname.substr(hostname.length - suffix.length - 1, suffix.length)
          , pathname: req.path
        };
    
    requestOpts = {
        url: format(urlObj)
      , method: method
      , encoding: 'binary'
      , headers: req.headers
    };
    
    requestOpts.headers.host = urlObj.hostname;
    
    if ('PUT' === method || 'POST' === method) {
      requestOpts.body = req.body;
    }
    
    request(requestOpts, function(err, proxyRes, body) {
      var hook
        , index = 0;
      
      if (err) return next(err);
      
      function proxyNext(err) {
        if (err) return next(err);
        
        hook = hooks[index++];
        
        if (!hook || res.headersSent) {
          res.headers = proxyRes.headers;
          res.end(proxyRes.body, 'binary');
          return;
        }
        
        if (hook.host.test(requestOpts.headers.host)) {
          hook.handle(proxyRes, body, proxyNext);
        } else {
          proxyNext();
        }
      }
      proxyNext();
    });
  };
};

/**
 * Register given hook.
 *
 * @param {String|RegExp} host
 * @param {Function} fn
 * @return {proxy}
 */

proxy.use = function(host, fn) {
  if (!fn) {
    fn = host;
    host = /.+/;
  }
  
  if ('[object RegExp]' !== Object.prototype.toString.call(host)) {
    host = new RegExp('^' + host + '$');
  }
  
  hooks.push({ host: host, handle: fn });
  
  return this;
};