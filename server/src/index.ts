import { parseArgs, styleText } from 'node:util';
import { Server } from '@pm2-logger/utils-server';

import { endpointsRouting } from './endpoints/routing.js';
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

const app = new Server();
app.use(endpointsRouting);

const server = app.listen(values.port, () => {
    const styledPort = styleText('blueBright', values.port);
    console.log(`The server is listening on port ${styledPort}.-`);

    process.once('SIGINT', () => {
        server.close();
    });
});