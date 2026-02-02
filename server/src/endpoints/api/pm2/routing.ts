import { Server } from '@utils/server';

import { GetController } from './get.controller.js';

export const pm2Routing = Server.router({
    path: '/pm2',
    controllers: [
        GetController
    ]
});