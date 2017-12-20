Nightwatch XHR
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors)
===

We've encountered some issues with our e2e tests.
We tried checking if clicks on specific links behave as they should (which also meant, send a POST XHR request to a tracking server).

Since we couldn't find any package for that, we wrote one.

So - this package waits for XHR to complete and enables a callback with its values for assertion.

Have fun!

Install
---
```shell
npm install nightwatch-xhr
```

or 

```shell
yarn add nightwatch-xhr
```

In order for your project to be able to access these commands and assertions you need to include them in your projects nightwatch config.
```
...
"custom_commands_path": ["./node_modules/nightwatch-xhr/src/commands"],
"custom_assertions_path: ["./node_modules/nightwatch-xhr/src/assertions"],
...
```

or, for legacy (ES5) Javascript, use

```
...
"custom_commands_path": ["./node_modules/nightwatch-xhr/es5/commands"],
"custom_assertions_path: ["./node_modules/nightwatch-xhr/es5/assertions"],
...
```

## Commands 

### waitForXHR
Calls the `trigger`, waits for a `delay` to complete, and then calls `callback` with an an array of all xhr requests corresponding to the given `urlPattern`. 

### waitForFirstXHR
Calls the `trigger`, and then calls `callback` with the first xhr request corresponding to the given `urlPattern`, failing if `timeout` is exceeded.  

### listenXHR
Only set up listening. If it has already been called, it resets the requests list.

### getXHR
Calls the `callback` with all requests corresponding to the given `urlPattern`. If given `delay` waits that time before failing. 

## Usage Examples
The function expects these parameters:
* urlPattern - a regex match for url pattern, will only listen to urls matching this, use '' for all urls.
* timeout - well, timeout
* trigger - activate a trigger in the browser after initiating the listener
* callback - use this to assert the request after it completes

### waitForFirstXHR Without Trigger:
```javascript
module.exports = {
    'Catch all XHRs': function (browser) {
        browser
            .url('some/path')
            .waitForFirstXHR('', 1000, null, function assertValues(xhr) {
                browser.assert.equal(xhr.status, "success");
                browser.assert.equal(xhr.method, "POST");
                browser.assert.equal(xhr.requestData, "200");
                browser.assert.equal(xhr.httpResponseCode, "200");
                browser.assert.equal(xhr.responseData, "");
            })
    }
 }
```

### waitForXHR With Click Trigger:
```javascript
module.exports = {
    'Catch all XHRs, trigger click': function (browser) {
        browser
            .url('some/path')
            .waitForXHR('', 1000, function browserTrigger() {
                browser.click('.tracking-link-1');
            }, function assertValues(xhrs) {
                browser.assert.equal(xhrs[0].status, "success");
                browser.assert.equal(xhrs[0].method, "POST");
                browser.assert.equal(xhrs[0].requestData, "200");
                browser.assert.equal(xhrs[0].httpResponseCode, "200");
                browser.assert.equal(xhrs[0].responseData, "");
            });
    }
}
```

### "Listening" to a specific URL or Regex
```javascript
module.exports = {
    'Catch user update request': function(browser) {
        browser
            .url('some/path')
            .waitForFirstXHR(
                'user\/([0-9]*)\/details',
                1000,
                function browserTrigger() {
                    browser.click('.update');
                },
                function assertValues(xhr) {
                    browser.assert.equal(xhr.status, "success");
                    browser.assert.equal(xhr.method, "POST");
                    browser.assert.equal(xhr.requestData, "200");
                    browser.assert.equal(xhr.httpResponseCode, "200");
                    browser.assert.equal(xhr.responseData, "");
                }
            );
    }
}
```

The callback function returns an object containing the following properties :
* status (success/error/timeout)
* method (GET/POST)
* url (url of request)
* requestData (raw POSTed data)
* httpResponseCode (HTTP status response code in string, eg: "200", )
* responseData (raw response data)

When the anticipated XHR request has not occurred, it fails an assertion. Callback is not called.

### With listenXHR / getXHR

```javascript
module.exports = {
    'Listens and the Gets': function(browser) {
      browser.url('some/path')
      .listenXHR()
      .doStuff()
      .doOtherStuff()
      .getXHR('some/pattern', xhrs => {
          browser.asset.equal(xhrs.find(x => x.method==='POST').status, 200);
      });
    }
}
```

### With listenXHR / getXHR and some delay

```javascript
module.exports = {
    'Listens and the Gets': function(browser) {
      browser.url('some/path')
      .listenXHR()
      .doStuff()
      .doOtherStuff()
      .getXHR('some/pattern', 1000, xhrs => {
          browser.asset.equal(xhrs.find(x => x.method==='POST').status, 200);
      });
    }
}
```

Contribute
---
Feel free to correct/improve the code and send in a pull request!

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/1014282?v=4" width="100px;"/><br /><sub><b>Or Zilca</b></sub>](http://www.smarteq.co.il)<br />[💻](https://github.com/cortexmg/nightwatch-xhr/commits?author=orzilca "Code") [📖](https://github.com/cortexmg/nightwatch-xhr/commits?author=orzilca "Documentation") [💡](#example-orzilca "Examples") [👀](#review-orzilca "Reviewed Pull Requests") | [<img src="https://avatars2.githubusercontent.com/u/45453?v=4" width="100px;"/><br /><sub><b>jalil</b></sub>](https://github.com/jalil)<br />[💻](https://github.com/cortexmg/nightwatch-xhr/commits?author=jalil "Code") [📖](https://github.com/cortexmg/nightwatch-xhr/commits?author=jalil "Documentation") [💡](#example-jalil "Examples") [👀](#review-jalil "Reviewed Pull Requests") [⚠️](https://github.com/cortexmg/nightwatch-xhr/commits?author=jalil "Tests") [🔧](#tool-jalil "Tools") | [<img src="https://avatars2.githubusercontent.com/u/12366410?v=4" width="100px;"/><br /><sub><b>Pixel</b></sub>](https://github.com/louis-bompart)<br />[🔧](#tool-louis-bompart "Tools") | [<img src="https://avatars3.githubusercontent.com/u/8048092?v=4" width="100px;"/><br /><sub><b>rdbmax</b></sub>](https://github.com/rdbmax)<br />[🔧](#tool-rdbmax "Tools") [⚠️](https://github.com/cortexmg/nightwatch-xhr/commits?author=rdbmax "Tests") |
| :---: | :---: | :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!