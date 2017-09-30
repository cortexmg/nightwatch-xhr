import { clientPoll, clientListen } from '../src/client';

const getFakeXMLHttpRequest = (open, send) => {
    const xhr = function() {
        this.readystate = 0;
    };
    xhr.prototype.send = send;
    xhr.prototype.onload = null;
    xhr.DONE = 4;
    xhr.prototype.open = function(method, url, request, response, success, timeout) {
        if (timeout) {
            this.readyState = 1;
            open();
        } else {
            this.status = success ? 200 : 404;
            this.responseText = response;
            this.readyState = xhr.DONE;
            this.send(request);
            this.onload();
            open();
        }
    };
    return xhr;
};

describe('client', () => {
    beforeEach(() => {
        delete window.xhrId;
    });

    describe('clientListen', () => {
        it('saves correclty a successful call', () => {
            const open = jest.fn();
            const send = jest.fn();

            expect(window).toBeDefined();

            window.XMLHttpRequest = getFakeXMLHttpRequest(open, send);

            clientListen('google', 'xhrId');

            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://www.google.fr', 'request', 'response', true);

            expect(window.xhrId).toBeDefined();
            expect(window.xhrId.status).toEqual('success');
            expect(window.xhrId.method).toEqual('GET');
            expect(window.xhrId.url).toEqual('http://www.google.fr');
            expect(window.xhrId.requestData).toEqual('request');
            expect(window.xhrId.responseData).toEqual('response');
            expect(window.xhrId.httpResponseCode).toEqual(200);
        });
        it('saves correctly an unsuccessful call', () => {
            const open = jest.fn();
            const send = jest.fn();

            expect(window).toBeDefined();

            window.XMLHttpRequest = getFakeXMLHttpRequest(open, send);

            clientListen('google', 'xhrId');

            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://www.google.fr', 'request', 'response', false);

            expect(window.xhrId).toBeDefined();
            expect(window.xhrId.status).toEqual('error');
            expect(window.xhrId.method).toEqual('GET');
            expect(window.xhrId.url).toEqual('http://www.google.fr');
            expect(window.xhrId.requestData).toEqual('request');
            expect(window.xhrId.responseData).toEqual('response');
            expect(window.xhrId.httpResponseCode).toEqual(404);
        });
        it('saves nothing in case of timeout', () => {
            const open = jest.fn();
            const send = jest.fn();

            expect(window).toBeDefined();

            window.XMLHttpRequest = getFakeXMLHttpRequest(open, send);

            clientListen('google', 'xhrId');

            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://www.google.fr', 'request', 'response', false, true);

            expect(window.xhrId).not.toBeDefined();
        });
    });
    describe('clientPoll', () => {
        it('retreives saved data if any', () => {
            global.window.xhrId = {
                status: 'success',
                method: 'GET',
                url: 'some/url',
                httpResponseCode: 200,
                requestData: 'request',
                responseData: 'response,'
            };
            const result = clientPoll('xhrId');

            expect(result).toBeDefined();
            expect(result.status).toBeDefined();
            expect(result.status).toEqual('success');
            expect(result.url).toEqual('some/url');
            expect(result.httpResponseCode).toEqual(200);
        });
        it('retreives null if xhr as been intercepted', () => {
            const result = clientPoll('xhrId');
            expect(result).toBeNull();
        });
    })
});
