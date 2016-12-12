Nightwatch XHR
===

We've encountered some issues with our e2e tests.
We tried checking if clicks on specific links behave as they should (which also meant, send a POST XHR request to a tracking server).

Since we couldn't find any package for that, we wrote one.

So - this package waits for XHR to complete and enables a callback with its values for assertion.

Have fun!

Install
---
```javascript
npm install nightwatch-xhr
```

In order for your project to be able to access these commands and assertions you need to include them in your projects nightwatch config.
```
...
"custom_commands_path": "./node_modules/nightwatch-xhr/lib",
...
```

Usage Example
---
The function expects these parameters:
* requestUrl - a regex match for url pattern, will only listen to urls matching this, use '' for all urls.
* Timeout - well, timeout
* callback - use this to assert the request after it completes
* trigger - activate a trigger in the browser after initiating the listener

With Trigger:
```javascript
module.exports = { 
    'Load page, wait for XHR': function (browser) {
        browser
            .url('some/path')
            .waitForXHR('', 1000, function assertValues(status, method, url, http_response_code, request_data) {
                browser.assert.equal(status, "success");
                browser.assert.equal(method, "POST");
                browser.assert.equal(http_response_code, "200");
            })
    }
```

With Click Trigger:
```javascript
module.exports = { 
    'Load page, wait for XHR': function (browser) {
        browser
            .url('some/path')
            .waitForXHR('', 1000, function assertValues(status, method, url, http_response_code, request_data) {
                browser.assert.equal(status, "success");
                browser.assert.equal(method, "POST");
                browser.assert.equal(http_response_code, "200");
            }, function browser_trigger() {
                 browser.click('.tracking-link-1');
            });
    }
    
```


The callback function returns the following arguments:
* status (success/error/timeout)
* method (GET/POST)
* url (url of request)
* http_response_code (HTTP status response code, eg: 200)
* request_data (JSON of request parameters)

Contribute
---
Feel free to correct/improve the code and send in a pull request!
