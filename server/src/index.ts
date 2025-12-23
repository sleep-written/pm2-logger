import { parseArgs } from 'node:util';
import express from 'express';

import { apiRouting } from './api/routing.js';

const { values: { port } } = parseArgs({
    options: {
        port: {
            type: 'string',
            default: '8080',
            multiple: false
        }
    }
});

const app = express();
app.use(apiRouting);
const server = app.listen(parseInt(port), () => {
    console.log('ready!');
});

await new Promise<void>(resolve => {
    process.once('SIGINT', () => server.close());
    server.once('close', () => resolve());
});