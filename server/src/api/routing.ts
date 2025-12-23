import express from 'express';

import { testController } from './test.controller.js';
import { angularController } from './angular.controller.js';

export const apiRouting = express.Router();
apiRouting.use(testController);
apiRouting.use(angularController);