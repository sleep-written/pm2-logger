import type { ExpressRouterObject } from './express-router.object.js';

export interface ServerOptions {
    port: number;

    routers?: {
        path?: string;
        router: ExpressRouterObject;
    }[];

    controllers?: (new() => unknown)[];
}