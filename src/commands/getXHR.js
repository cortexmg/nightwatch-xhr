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

GetXHR.prototype.command = function (urlPattern:string = '', callback:Callback) {
    const command = this;
    this.api.execute(clientPoll, [], function ({value: xhrs}: { value: ?Array<ListenedXHR> }) {
        if (xhrs && xhrs.length) {
            const filtered = xhrs.filter(
                xhr => xhr.url.match(urlPattern)
            );
            if (filtered && filtered.length) {
                // console.warn(`Got ${xhrs.length} request(s) for urlPattern ${urlPattern}`);
                callback(filtered);
                command.emit('complete');
                return;
            }
        }
        callback([]);
    });
};

module.exports = GetXHR;
