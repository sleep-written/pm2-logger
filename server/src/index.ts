import { Mocks } from '@mocks/index.js';
import { Server } from '@pm2-logger/utils-server';

import { endpointsRouting } from './endpoints/routing.js';

const mocks = new Mocks();
mocks.execute();

const app = new Server();
app.use(endpointsRouting);

const server = app.listen(8080, () => {
    console.log('ready!');
    process.once('SIGINT', () => {
        server.close();
    });
});