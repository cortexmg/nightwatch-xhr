export const clientListen = function (clientUrlPattern, clientListenId) {
    XMLHttpRequest.lastListenId = clientListenId;
    if (!XMLHttpRequest.customized) {
        XMLHttpRequest.realSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.realOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            if (url.match(clientUrlPattern)) {
                this.listen = { method, url, clientListenId: XMLHttpRequest.lastListenId };
                this.onload = function () {
                    if (this.readyState === XMLHttpRequest.DONE) {
                        this.listen.httpResponseCode = this.status;
                        this.listen.responseData = this.responseText;
                        if (this.status === 200) {
                            this.listen.status = "success";
                        } else {
                            this.listen.status = "error";
                        }
                        window[XMLHttpRequest.lastListenId] = this.listen;
                    }
                };
            }
            XMLHttpRequest.realOpen.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function (data) {
            if (this.listen)
                this.listen.requestData = data;
            else this.listen = { requestData: data};

            XMLHttpRequest.realSend.apply(this, arguments);
        };
        XMLHttpRequest.customized = true;
    }
};

export const clientPoll = function (clientListenId) {
    if (window[clientListenId])
        return window[clientListenId];
    return null;
};

