import { Server } from '@pm2-logger/utils-server';

import { pm2Routing } from './pm2/routing.js';

export const apiRouting = Server.router({
    path: '/api',
    routers: [
        pm2Routing
    ]
});