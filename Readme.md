# connect-tweek

  A extensible proxy middleware for Connect/Express. Concept taken from [Newstweek](http://newstweek.com/).

## Usage

```javascript
var connect = require('connect')
  , proxy = require('connect-tweek');

proxy
  .use(function(res, body, next) {
    // display body
    console.log(body);
    next();
  })
  .use(function(res, body, next) {
    // add access control headers
    res.headers['Access-Control-Allow-Origin'] = '*/*';
    res.headers['Access-Control-Allow-Credentials'] = 'true';
    next();
  })
  .use(function(res, body, next) {
    // modify response body
    res.body = body.replace('foo', 'bar');
    next();
  })
  .use('www.youtube.com', function(res, body, next) {
    // scrape for YouTube contents.
    var cheerio = require('cheerio')
      , $ = cheerio.load(body);
      
    $('body')
      .prepend('<img src="http://www.cs.cmu.edu/~chuck/lennapg/len_std.jpg">'); // inject lenna.
    
    next();
  });

// http://www.google.com.proxy.example.com/humans.txt
//   -> http://www.google.com/humans.txt
var app = connect()
  .use(connect.vhost('*.proxy.example.com', proxy({ suffix: 'proxy.example.com' })))
  .listen(3000);
```
