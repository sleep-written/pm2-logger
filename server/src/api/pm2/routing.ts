import express from 'express';

import { processRouting } from './process/routing.js';

export const pm2Routing = express.Router();
pm2Routing.use('/process', processRouting);