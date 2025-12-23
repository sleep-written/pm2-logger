import express from 'express';
import { PM2 } from '@pm2-logger/utils-pm2';

export const getController = express.Router();
getController.get('/', (_, res) => {
    const pm2 = new PM2();
    const list = pm2.list();
    res.json(list);
});