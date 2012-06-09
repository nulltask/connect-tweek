
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
  , mime = connect.mime
  , utils = connect.utils;

/**
 * Expose `middleware`.
 */

var middleware = module.exports = {};

/**
 * Options.
 */

middleware._options = {};

/**
 * Hooks.
 */

middleware._hooks = [];

/**
 * Types.
 */

middleware._types = [];

/**
 * Returns application as middleware.
 *
 * @params {Object} options
 * @return {Function}
 */

middleware.middleware = function(options) {
  var hooks = this._hooks
    , options = utils.merge(this._options, options)
    , suffix = options.suffix || '';

  return function proxy(req, res, next) {
    var reqOptions
      , method = req.method
      , hostname = req.headers.host
      , urlObj = {
            protocol: req.secure ? 'https' : 'http'
          , hostname: hostname.substr(0, hostname.length - suffix.length - 1)
          , pathname: utils.parseUrl(req).pathname
        };

    requestOpts = {
        url: format(urlObj)
      , method: method
      , encoding: 'binary'
      , headers: req.headers
    };
    
    requestOpts.headers.host = urlObj.hostname;
    delete requestOpts.headers['accept-encoding'];
    
    if ('PUT' === method || 'POST' === method) {
      requestOpts.body = req.body;
    }
    
    request(requestOpts, function(err, response, body) {
      var hook
        , ext = mime.extension(response.headers['content-type'])
        , index = 0;

      if (err) return next(err);
      
      function nextHook(err) {
        if (err) return next(err);
        
        hook = hooks[index++];
        
        if (!hook || res.headersSent) {
          res.writeHeader(response.statusCode, response.headers);
          res.end(response.body, 'binary');
          return;
        }
        
        if (hook.host.test(requestOpts.headers.host)
          && (0 === hook.ext.length || ~hook.ext.indexOf(ext))) {
          hook.handle(response, body, nextHook);
        } else {
          nextHook();
        }
      }
      nextHook();
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

middleware.use = function(host, fn) {
  if (!fn) {
    fn = host;
    host = /.+/;
  }
  
  if ('[object RegExp]' !== Object.prototype.toString.call(host)) {
    host = new RegExp('^' + host + '$');
  }
  
  this._hooks.push({ host: host, handle: fn, ext: this._types || [] });
  this._types = [];

  return this;
};

