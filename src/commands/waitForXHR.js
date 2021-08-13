// @flow

import type {Callback, ListenedXHR, Options, Trigger} from "../types";

const util = require('util');
const events = require('events');

import { clientListen, clientPoll } from '../client';

function WaitForXHR() {
    // $FlowFixMe
    events.EventEmitter.call(this);
}

util.inherits(WaitForXHR, events.EventEmitter);

WaitForXHR.prototype.command = function (
    urlPattern:string = '',
    delay: number = 1000,
    trigger: Trigger = () => {},
    callback: Callback = () => {},
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

    // console.log('Setting up timeout...');
    this.timeout = setTimeout(function () {
        command.api.execute(clientPoll, [], function ({ value:xhrs }: { value: ?Array<ListenedXHR> }) {
            //console.log('xhrss', xhrs);
            const matchingXhrs = xhrs ? xhrs.filter(xhr => xhr.url.match(command.urlPattern)) : [];
            if (matchingXhrs)
                command.callback(matchingXhrs);
            else
                api.assert.ok(false, 'Nothing heard', 'XHR Request', `No XHR opened with pattern ${urlPattern} !`);
            command.emit('complete');
        });
    }, delay);

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
