import express from 'express';

import { pm2Routing } from './pm2/routing.js';
import { angularController } from './angular.controller.js';

export const apiRouting = express.Router();
apiRouting.use('/pm2', pm2Routing);
apiRouting.use(angularController);