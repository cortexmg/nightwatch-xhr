// @flow

const util = require('util');
const events = require('events');

import { clientListen } from '../client';

function ListenXHR() {
    // $FlowFixMe
    events.EventEmitter.call(this);
}

util.inherits(ListenXHR, events.EventEmitter);

ListenXHR.prototype.command = function () {
    const command = this;
    this.api.execute(clientListen, [], function () {
        command.emit('complete');
    });
};

module.exports = ListenXHR;
