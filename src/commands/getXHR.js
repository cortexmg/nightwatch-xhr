// @flow
import type {Callback, ListenedXHR} from "../types";

const util = require('util');
const events = require('events');

import { clientPoll } from '../client';

function GetXHR() {
    // $FlowFixMe
    events.EventEmitter.call(this);
}

util.inherits(GetXHR, events.EventEmitter);

GetXHR.prototype.reschedulePolling = function() {
    const command = this;
    this.pollingInterval = setTimeout(() => command.poll.call(command), 100);
};

GetXHR.prototype.poll = function () {
    const command = this;
    this.api.execute(clientPoll, [], function ({ value:xhrs }: { value: ?Array<ListenedXHR> }) {
        if (xhrs && xhrs.length) {
            const filtered = xhrs.filter(xhr => xhr.url.match(command.urlPattern));
            if (filtered && filtered.length) {
                command.callback(filtered);
                clearInterval(command.pollingInterval);
                clearTimeout(command.timeout);
                command.emit('complete');
                return true;
            }
        }

        command.reschedulePolling.call(command);
        return false;
    });
};

GetXHR.prototype.command = function (urlPattern:string = '', delay:?number, callback:Callback) {
    this.callback = callback;
    this.urlPattern = urlPattern;
    const command = this;

    if (delay) {
        this.reschedulePolling();

        this.timeout = setTimeout(function () {
            clearInterval(command.pollingInterval);
            command.client.assertion(false, 'Timed out', 'XHR Request', `Timed out waiting for ${urlPattern} XHR !`);
            command.emit('complete');
        }, delay);
    } else {
        if (!this.poll())
            callback([]);
    }
};

module.exports = GetXHR;
