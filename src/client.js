export const clientListen = function () {
    const getXhr = id => window.xhrListen.find(xhr => xhr.id === id);
    const rand = () => Math.random() * 16 | 0;
    const uuidV4 = () =>
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            .replace(/[xy]/g, c => (
                (c === 'x'
                        ? rand()
                        : rand() & 0x3 | 0x8
                ).toString(16)
            ));

    window.xhrListen = [];

    if (!XMLHttpRequest.customized) {
        XMLHttpRequest.realSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.realOpen = XMLHttpRequest.prototype.open;

        XMLHttpRequest.prototype.open = function (method, url) {
            this.id = uuidV4();
            window.xhrListen.push({
                id: this.id,
                method,
                url,
                openedTime: Date.now(),
            });
            this.onload = function () {
                if (this.readyState === XMLHttpRequest.DONE) {
                    const xhr = getXhr(this.id);
                    xhr.httpResponseCode = this.status;
                    xhr.responseData = this.responseText;
                    xhr.status = (this.status === 200 ? 'success' : 'error');
                }
            };
            XMLHttpRequest.realOpen.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function (data) {
            const xhr = getXhr(this.id);
            xhr.requestData = data;

            XMLHttpRequest.realSend.apply(this, arguments);
        };
        XMLHttpRequest.customized = true;
    }
};

export const clientPoll = function () {
    return window.xhrListen || [];
};
