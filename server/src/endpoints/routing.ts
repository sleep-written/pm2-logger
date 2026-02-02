import { Server } from '@utils/server';

import { apiRouting } from './api/routing.js';
import { AngularController } from './angular.controller.js';

export const endpointsRouting = Server.router({
    routers: [ apiRouting ],
    controllers: [ AngularController ]
});