import type { HTTPMethods } from './http-methods.js';

export interface ExpressRouterObject extends HTTPMethods {
    use(o: ExpressRouterObject): void;
    use(path: string, o: ExpressRouterObject): void;
}