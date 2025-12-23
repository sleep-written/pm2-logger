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
app.listen(parseInt(port), () => {
    console.log('ready!');
});