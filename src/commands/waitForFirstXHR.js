// @flow
import type { Callback, ListenedXHR, Options, Trigger } from '../types';

const util = require('util');
const events = require('events');

import { clientListen, clientPoll } from '../client';

function WaitForXHR() {
    // $FlowFixMe
    events.EventEmitter.call(this);
}

util.inherits(WaitForXHR, events.EventEmitter);

WaitForXHR.prototype.reschedulePolling = function() {
    const command = this;
    this.pollingInterval = setTimeout(() => command.poll.call(command), 100);
};

WaitForXHR.prototype.poll = function () {
    const command = this;
    this.api.execute(clientPoll, [], function ({ value:xhrs }: { value: ?Array<ListenedXHR> }) {
        if (xhrs && xhrs.length) {
            const filtered = xhrs.filter(xhr => xhr.url.match(command.urlPattern));
            if (filtered && filtered.length && filtered[0].status) {
                console.warn(`Got ${filtered[0].status} response for id ${command.xhrListenId}`);
                command.callback(filtered[0]);
                clearInterval(command.pollingInterval);
                clearTimeout(command.timeout);
                command.emit('complete');
                return;
            }
        }

        command.reschedulePolling.call(command);
    });
};

WaitForXHR.prototype.command = function (
    urlPattern:string = '',
    timeout: number = 1000,
    trigger: Trigger = () => {},
    callback: Callback = () => {}
) {
    const command = this;
    const { api } = this;
    this.callback = callback;
    this.urlPattern = urlPattern;

    // console.log('Verifying request ...');
    if (typeof urlPattern === 'string') {
        // throw new Error('urlPattern should be empty, string or regular expression');
    }
    if (typeof trigger !== 'function') {
        throw new Error('trigger should be a function');
    }
    if (typeof callback !== 'function') {
        throw new Error('callback should be a function');
    }

    // console.log('Setting up listening...');
    api.execute(clientListen, [], function (res) {
        // console.warn('Listening XHR requests');
    });

    // console.log('Setting up polling interval ...');
    this.reschedulePolling();

    // console.log('Setting up timeout...');
    this.timeout = setTimeout(function () {
        console.log(util.format('[WaitForXHR TimeOut] %s ms, no XHR request for pattern : "%s"', timeout, urlPattern));
        clearInterval(command.pollingInterval);
        // callback(command.client.api, new Error());
        // his.fail({value:false}, 'not found', this.expectedValue, defaultMsg);
        api.assert.ok(false, 'Timed out', 'XHR Request', `Timed out waiting for ${urlPattern} XHR !`);
        command.emit('complete');
    }, timeout);

    // console.log('Handling trigger ...');
    if (trigger) {
        if (typeof trigger === "function")
            trigger();
        else if (typeof trigger === "string")
            api.click(trigger);
    }
    // console.log('Done');
    return this;
};

module.exports = WaitForXHR;
