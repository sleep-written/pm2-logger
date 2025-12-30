import type { IncomingMessage, Server, ServerResponse } from 'node:http';
import type { ExpressRouterObject } from './express-router.object.js';

export interface ExpressApplicationObject extends ExpressRouterObject {
    listen(
        port: number,
        callback: (err?: Error) => unknown
    ): Server<
        typeof IncomingMessage,
        typeof ServerResponse
    >;
}