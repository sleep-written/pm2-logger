import type { ExpressRouterObject } from './express-router.object.js';
import express from 'express';

export interface RouterOptions<R extends ExpressRouterObject> {
    path?: string;
    options?: express.RouterOptions;
    routers?: R[];
    controllers?: (new() => unknown)[];
}