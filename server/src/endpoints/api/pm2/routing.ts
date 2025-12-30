import { Server } from '@pm2-logger/utils-server';

import { GetController } from './get.controller.js';

export const pm2Routing = Server.router({
    path: '/pm2',
    controllers: [
        GetController
    ]
});