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

GetXHR.prototype.poll = function () {
    const command = this;
    this.api.execute(clientPoll, [], function ({ value:xhrs }: { value: ?Array<ListenedXHR> }) {
        command.callback(xhrs.filter(xhr => xhr.url.match(command.urlPattern)));
        clearInterval(command.pollingInterval);
        clearTimeout(command.timeout);
        command.emit('complete');
    });
};

GetXHR.prototype.command = function (urlPattern:string = '', delay:?number, callback:Callback) {
    this.callback = callback;
    this.urlPattern = urlPattern;
    const command = this;

    if (delay) {
        setTimeout(() => command.poll.apply(this), delay);
    } else {
        this.poll();
    }
};

module.exports = GetXHR;
