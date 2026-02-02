import { Server } from '@utils/server';

import { pm2Routing } from './pm2/routing.js';

export const apiRouting = Server.router({
    path: '/api',
    routers: [
        pm2Routing
    ]
});