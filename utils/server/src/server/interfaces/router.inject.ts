import type { ExpressRouterObject } from './express-router.object.js';
import type { RouterOptions } from 'express';

export interface RouterInject<R extends ExpressRouterObject> {
    createRouter?(o?: RouterOptions | undefined): R;
}