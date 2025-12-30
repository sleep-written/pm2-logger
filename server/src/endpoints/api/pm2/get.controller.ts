import type { Request, Response } from 'express';

import { Server } from '@pm2-logger/utils-server';
import { PM2 } from '@pm2-logger/utils-pm2';

export class GetController {
    #pm2 = Server.inject(PM2);

    @Server.endpoint({ type: 'get' })
    async get(_: Request, res: Response): Promise<void> {
        const list = this.#pm2.list();
        res.json(list);
    }
}