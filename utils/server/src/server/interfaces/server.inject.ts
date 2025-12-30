import type { ExpressRouterObject } from './express-router.object.js';
import type { RouterOptions } from 'express';

export interface ServerInject<T extends ExpressRouterObject> {
    createRouter?(o?: RouterOptions): T;
}