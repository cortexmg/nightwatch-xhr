var util = require('util');
var events = require('events');

var XMLHttpRequest;
var responseContainer = 'xhrResponse' + (new Date()).getTime();

function WaitForXHR() {
  events.EventEmitter.call(this);
}

util.inherits(WaitForXHR, events.EventEmitter);

WaitForXHR.prototype.command = function (requestURL, trigger, callback, timeout_wait_in_ms) {
  var self = this;

  //this.api.timeoutsAsyncScript(timeout_wait_in_ms);
  self.api.execute(function (windowRequestURL, windowResponseContainer, timeout_wait_in_ms) {
    var waitForXHRResponse = function (requestURL, callback, timeout) {
      var origin_send = XMLHttpRequest.prototype.send;
      var origin_open = XMLHttpRequest.prototype.open;
      var requestURL_regex = new RegExp(requestURL);

      XMLHttpRequest.prototype.send = function (data) {
        this.xhr_request_data.request_data = data;
        this.xhr_timeout_init && this.xhr_timeout_init();
        origin_send.apply(this, arguments);
      };

      XMLHttpRequest.prototype.open = function (method, url) {
        var that = this;
        if (url && url.match(requestURL_regex)) {
          this.xhr_request_data = {};
          this.xhr_request_data.method = method;
          this.xhr_request_data.url = url;
          this.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE) {
              this.xhr_timeout_pointer && clearTimeout(this.xhr_timeout_pointer);
              this.xhr_request_data.http_response_code = this.status;
              if (this.status === 200) {
                this.xhr_request_data.status = "success";
              } else {
                this.xhr_request_data.status = "error";
              }

              callback && callback(this.xhr_request_data);
            }
          };

          this.xhr_timeout_init = function () {
            this.xhr_timeout_pointer = setTimeout(function () {
              that.onreadystatechange = function () {
                // nothing
              };

              that.xhr_request_data.status = 'timeout';

              callback && callback(that.xhr_request_data);
            }, timeout);
          };
        }
        origin_open.apply(this, arguments);
      };
    };

    var __createAttribute = function (key, value) {
      var att = document.createAttribute(key);
      att.value = value;
      return att;
    };

    waitForXHRResponse(windowRequestURL, function success(data) {
      window[windowResponseContainer] = data;
      var responseDiv = document.createElement('DIV');
      responseDiv.id = windowResponseContainer;
      debugger;
      for (var key in data) {
        if (data.hasOwnProperty(key)) {

          try {
            var requestData = JSON.parse(data[key]);

            for (var innerKey in requestData) {
              if (requestData.hasOwnProperty(innerKey)) {
                var attribute = __createAttribute(key + "." + innerKey, requestData[innerKey]);
                responseDiv.setAttributeNode(attribute);
              }
            }

          } catch (e) {
            responseDiv.setAttributeNode(__createAttribute(key, data[key]));
          }

        }
      }

      document.body.appendChild(responseDiv);
    }, timeout_wait_in_ms);


  }, [requestURL, responseContainer, timeout_wait_in_ms], function (res) {
    // todo: log success message
  });

  // trigger
  if (trigger) {
    if (typeof trigger === "function") {
      // todo: log message
      trigger();
    }
    else if (typeof trigger === "string") {
      // todo: log message
      self.api.click(trigger);
    }
  }

  // get response from browser
  self.api
    // wait for response element
    .waitForElementPresent("#" + responseContainer)

    // return response
    .execute(function (windowResponseContainer) {
      return window[windowResponseContainer];
    }, [responseContainer], function (result) {
      callback && callback(responseContainer, result);
      self.emit('complete');
    });

  return this;
};

module.exports = WaitForXHR;