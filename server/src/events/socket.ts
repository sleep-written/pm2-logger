import { Socket } from '@pm2-logger/utils-socket';

import { LogEvent } from './log.event.js';

export const eventsSocket = new Socket({
    events: [
        LogEvent
    ]
});