String.prototype.trunc = String.prototype.trunc ||
    function(n) {
        return (this.length > n) ? this.substr(0, n-3) + '...' : this;
    };

exports.assertion = function XHRSuccess(listenedXhr = { }) {
    this.message = listenedXhr.url
        ? `Expected ${listenedXhr.url.trunc(30)} be to called successfully`
        : 'Expected unknown url to be called successfully';
    this.expected = 'success';
    this.pass = function(value) { return value === this.expected};
    this.value = function(result) { return result; };
    this.command = function command(callback) {
        const self = this;
        setImmediate(() => callback.call(self, listenedXhr.status));
        return this;
    };
};
