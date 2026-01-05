import { parseArgs, styleText } from 'node:util';
import express from 'express';
import http from 'http';

import { endpointsRouting } from './endpoints/routing.js';
import { eventsSocket } from './events/socket.js';
import { Mocks } from './mocks/index.js';

const { values } = parseArgs({
    options: {
        port: {
            type: 'string',
            short: 'p',
            default: '8080',
            multiple: false
        },
        mocks: {
            type: 'string',
            short: 'm',
            default: [],
            multiple: true
        }
    }
});

const mocks = new Mocks(values.mocks);
mocks.execute();

const app = express();
app.use(endpointsRouting);

const server = http.createServer(app);
eventsSocket.use(server);

server.listen(values.port, () => {
    const styledPort = styleText('blueBright', values.port);
    console.log(`The server is listening on port ${styledPort}.-`);
});

process.once('SIGINT', () => {
    server.listening &&
    server.close();
});