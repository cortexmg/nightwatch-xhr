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
            this.send(request);
            open(method, url);
        } else {
            this.status = success ? 200 : 404;
            this.responseText = response;
            this.response = response;
            this.readyState = xhr.DONE;
            this.send(request);
            this.onload();
            open(method, url);
        }
    };
    return xhr;
};

const sortByUrl = array => array.sort((a, b) => a.url.localeCompare(b.url));

describe('client', () => {
    beforeEach(() => {
        delete window.xhrListen;
        const open = jest.fn();
        const send = jest.fn();
        window.XMLHttpRequest = getFakeXMLHttpRequest(open, send);
    });

    describe('clientListen', () => {
        it('saves correclty a successful call', () => {
            clientListen();

            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://www.google.fr', 'request', 'response', true);

            expect(window.xhrListen).toBeDefined();
            expect(window.xhrListen).toHaveLength(1);
            expect(window.xhrListen[0].status).toEqual('success');
            expect(window.xhrListen[0].method).toEqual('GET');
            expect(window.xhrListen[0].url).toEqual('http://www.google.fr');
            expect(window.xhrListen[0].requestData).toEqual('request');
            expect(window.xhrListen[0].responseData).toEqual('response');
            expect(window.xhrListen[0].httpResponseCode).toEqual(200);
        });
        it('saves correctly an unsuccessful call', () => {
            clientListen();

            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://www.google.fr', 'request', 'response', false);

            expect(window.xhrListen).toBeDefined();
            expect(window.xhrListen[0].status).toEqual('error');
            expect(window.xhrListen[0].method).toEqual('GET');
            expect(window.xhrListen[0].url).toEqual('http://www.google.fr');
            expect(window.xhrListen[0].requestData).toEqual('request');
            expect(window.xhrListen[0].responseData).toEqual('response');
            expect(window.xhrListen[0].httpResponseCode).toEqual(404);
        });
        it('saves only request in case of timeout', () => {
            clientListen();

            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://www.google.fr', 'request', 'response', false, true);

            expect(window.xhrListen).toBeDefined();
            expect(window.xhrListen[0].method).toEqual('GET');
            expect(window.xhrListen[0].url).toEqual('http://www.google.fr');
            expect(window.xhrListen[0].requestData).toEqual('request');
            expect(window.xhrListen[0].responseData).toBeUndefined();
            expect(window.xhrListen[0].httpResponseCode).toBeUndefined();
        });
        it('saves multiple requests', () => {
            clientListen();

            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://www.google.fr', 'request', 'response', false);
            xhr.open('GET', 'https://gateway.marvel.com', 'request', 'response', true);
            xhr.open('POST', 'https://api.github.com', 'request', 'response', true);

            expect(window.xhrListen).toBeDefined();
            expect(window.xhrListen).toBeInstanceOf(Array);
            expect(window.xhrListen).toHaveLength(3);

            expect(sortByUrl(window.xhrListen)).toMatchObject(sortByUrl([
                {
                    method: 'GET',
                    url: 'https://gateway.marvel.com',
                    requestData: 'request',
                    httpResponseCode:200,
                    responseData: 'response',
                    status: 'success',
                },
                {
                    method: 'GET',
                    url: 'http://www.google.fr',
                    requestData: 'request',
                    httpResponseCode:404,
                    status: 'error'
                },
                {
                    method: 'POST',
                    url: 'https://api.github.com',
                    requestData: 'request',
                    httpResponseCode:200,
                    responseData: 'response',
                    status: 'success',
                },
            ]));
        });
    });
    describe('clientPoll', () => {
        it('retreives saved data if any', () => {
            global.window.xhrListen = [{
                status: 'success',
                method: 'GET',
                url: 'some/url',
                httpResponseCode: 200,
                requestData: 'request',
                responseData: 'response,'
            }];
            const result = clientPoll();

            expect(result).toBeDefined();
            expect(result[0].status).toBeDefined();
            expect(result[0].status).toEqual('success');
            expect(result[0].url).toEqual('some/url');
            expect(result[0].httpResponseCode).toEqual(200);
        });
        it('retreives empty array if no xhr has been intercepted', () => {
            const result = clientPoll();
            expect(clientPoll()).toEqual([]);
        });
    })
});
