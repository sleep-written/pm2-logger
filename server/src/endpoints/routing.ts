import { Server } from '@pm2-logger/utils-server';

import { apiRouting } from './api/routing.js';
import { AngularController } from './angular.controller.js';

export const endpointsRouting = Server.router({
    routers: [ apiRouting ],
    controllers: [ AngularController ]
});