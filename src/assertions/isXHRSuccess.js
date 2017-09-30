String.prototype.trunc = String.prototype.trunc ||
    function(n) {
        return (this.length > n) ? this.substr(0, n-1) + '...' : this;
    };

exports.assertion = function XHRSuccess(listenedXhr) {
    this.message = `Expected ${listenedXhr.url.trunc(30)} to called successfully`;
    this.expected = 'success';
    this.pass = function(value) { return value === this.expected};
    this.value = function(result) { return result.status; };
    this.command = function command(callback) {
        const self = this;
        setImmediate(() => callback.call(self, listenedXhr));
        return this;
    };
};
