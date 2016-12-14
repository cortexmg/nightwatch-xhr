var util = require('util');
var events = require('events');

function WaitForXHR() {
    events.EventEmitter.call(this);
}

util.inherits(WaitForXHR, events.EventEmitter);

var responseContainer = 'xhrResponse_data' + (new Date()).getTime();

WaitForXHR.prototype.command = function (requestURL, timeout_wait_in_ms, callback_WaitForXHR, trigger) {

    //console.log('BEGIN WaitForXHR', responseContainer);
    var self = this;
    if (requestURL && typeof  requestURL != "string") {
        throw new Error("trigger should be empty or function");
    }
    if (trigger && typeof  trigger != "function") {
        throw new Error("trigger should be empty or function");
    }

    if (callback_WaitForXHR && typeof callback_WaitForXHR != 'function') {
        throw new Error('callback_WaitForXHR should be a function');
    }
    requestURL = requestURL || '';


    self.api.waitForElementPresent("html");
    self.api.execute(function (windowRequestURL, windowResponseContainer, timeout_wait_in_ms) {
        var waitForXHRResponse = function (requestURL, callback_waitForXHRResponse, timeout) {
            XMLHttpRequest.waiting_xhr_url = new RegExp(requestURL);
            if (!XMLHttpRequest.customized) {
                XMLHttpRequest.customized = true;
                XMLHttpRequest.origin_send = XMLHttpRequest.prototype.send;
                XMLHttpRequest.origin_open = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.send = function (data) {
                    this.xhr_request_data.request_data = data;
                    this.xhr_timeout_init && this.xhr_timeout_init();
                    XMLHttpRequest.origin_send.apply(this, arguments);
                };
                XMLHttpRequest.prototype.open = function (method, url) {
                    console.log('XMLHttpRequest.prototype.open');
                    var that = this;
                    if (XMLHttpRequest.waiting_xhr_url && url && url.match(XMLHttpRequest.waiting_xhr_url)) {
                        this.xhr_request_data = {};
                        this.xhr_request_data.method = method;
                        this.xhr_request_data.url = url;
                        this.onreadystatechange = function () {
                            if (this.readyState === XMLHttpRequest.DONE) {
                                this.xhr_timeout_pointer && clearTimeout(this.xhr_timeout_pointer);
                                this.xhr_request_data.http_response_code = this.status;
                                if (this.status === 200) {
                                    console.log('XHR success');
                                    this.xhr_request_data.status = "success";
                                } else {
                                    console.log('XHR error');
                                    this.xhr_request_data.status = "error";
                                }

                                callback_waitForXHRResponse && callback_waitForXHRResponse(this.xhr_request_data);
                                console.log('this.onreadystatechange  end');
                            }
                        };
                        this.xhr_timeout_init = function () {
                            this.xhr_timeout_pointer = setTimeout(function () {
                                that.onreadystatechange = function () {
                                    //remove custom defined onreadystatechange
                                }
                                that.xhr_request_data.status = 'timeout';
                                console.log('XHR timeout');
                                callback_waitForXHRResponse && callback_waitForXHRResponse(that.xhr_request_data);
                                console.log('this.xhr_timeout_pointer end');
                            }, timeout);
                        };
                    }
                    XMLHttpRequest.origin_open.apply(this, arguments);
                };
            }

        };

        waitForXHRResponse(windowRequestURL, function success(data) {
            window[windowResponseContainer] = data;
        }, timeout_wait_in_ms);


    }, [requestURL, responseContainer, timeout_wait_in_ms], function (res) {
        // todo: log success message
    });

    self.child_interval = setInterval(function () {
        //console.log('START: child_intervals');
        self.api.execute(function (windowResponseContainer) {
            var data = window[windowResponseContainer];
            //console.log('window[' + windowResponseContainer + ']=', data);
            if (data) {
                //console.log('DELETED window[' + windowResponseContainer + ']=', data);
                window[windowResponseContainer] = undefined;
                delete window[windowResponseContainer];
            } else {
                data = null;
            }
            return data;
        }, [responseContainer], function (result) {
            //console.log('START: child_interval callback');
            if (result && result.state && result.state === 'success' && result.value) {
                console.log('XHR catched value:', result.value);
                callback_WaitForXHR && callback_WaitForXHR(result.value.status, result.value.method, result.value.url, result.value.http_response_code, result.value.request_data);
                //console.log('CLEAR INTERVAL START');
                clearInterval(self.child_interval);
                //console.log('CLEAR INTERVAL END');
                self.emit('complete');
            }
            //console.log('END: child_interval callback');
        });
        //console.log('FINISH: child_interval');
    }, 100);

    setTimeout(function () {
        var response = '!!!! WaitForXHR TimeOut :' + timeout_wait_in_ms + ' missing_XHR_request for regex string: "' + requestURL + '".';
        console.log(response);
        callback_WaitForXHR && callback_WaitForXHR(response);
        clearInterval(self.child_interval);
        clearInterval(self.master_interval);
        self.emit('complete');
    }, timeout_wait_in_ms + 10 * 1000);

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
    return this;
};


module.exports = WaitForXHR;