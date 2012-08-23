[![build status](https://secure.travis-ci.org/uniba/connect-tweek.png)](http://travis-ci.org/uniba/connect-tweek)
# connect-tweek

  A extensible proxy middleware for Connect/Express. Concept taken from [Newstweek](http://newstweek.com/).

## Installation

```
$ npm install connect-tweek
```

## Usage

```javascript
var connect = require('connect')
  , tweek = require('connect-tweek')
  , proxy = tweek();

proxy
  .use(function(res, body, next) {
    // add access control headers
    res.headers['Access-Control-Allow-Origin'] = '*/*';
    res.headers['Access-Control-Allow-Credentials'] = 'true';
    next();
  })
  .txt.html.js.use(function(res, body, next) {
    // display body for txt, html and js
    console.log(body);
    next();
  })
  .html.use('www.youtube.com', function(res, body, next) {
    // scrape html for YouTube contents.
    var cheerio = require('cheerio')
      , $ = cheerio.load(body);
      
    $('body')
      .prepend('<img src="http://www.cs.cmu.edu/~chuck/lennapg/len_std.jpg">'); // inject lenna.
    
    res.body = $.html();
    next();
  });

// http://www.google.com.proxy.example.com/humans.txt
//   -> http://www.google.com/humans.txt
var app = connect()
  .use(connect.vhost('*.proxy.example.com', proxy.middleware({ suffix: 'proxy.example.com' })))
  .listen(3000);
```

## License

(The MIT License)

Copyright (c) 2012 Uniba Inc. &lt;info@uniba.jp&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
