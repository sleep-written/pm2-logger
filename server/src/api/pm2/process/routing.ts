import express from 'express';

import { getController } from './get.controller.js';

export const processRouting = express.Router();
processRouting.use(getController);