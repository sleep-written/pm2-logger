import type { ExpressRouterObject, RouterInject, RouterOptions } from './interfaces/index.js';

import { EndpointDecorator } from './endpoint.decorator.js';
import { EndpointError } from './endpoint.error.js';
import express from 'express';

export class RouterGenerator<R extends ExpressRouterObject = express.Router> {
    #endpointDecorator: EndpointDecorator;
    #inject: Required<RouterInject<R>>;
    #cache = new WeakMap<ExpressRouterObject, RouterOptions<R>>();

    constructor(endpointDecorator: EndpointDecorator, inject?: RouterInject<R>) {
        this.#endpointDecorator = endpointDecorator;
        this.#inject = {
            createRouter:   inject?.createRouter?.bind(inject)  ?? (o => express.Router(o))
        } as Required<RouterInject<R>>;
    }

    generate(options: RouterOptions<R>): R {
        const router = this.#inject.createRouter(options.options);
        this.#cache.set(router, options);

        options.routers?.forEach(routerTarget => {
            const { path } = this.#cache.get(routerTarget) ?? {};
            if (typeof path === 'string') {
                router.use(path, routerTarget);
            } else {
                router.use(routerTarget);
            }
        });

        const pathHashCache = new Set<string>();
        options.controllers
            ?.map(target => this.#endpointDecorator
                .getEndpoints(target)
                .map(({ method, options }) => ({ target, method, options }))
            )
            ?.flat()
            ?.forEach(({ target, method, options }) => {
                // Validate path
                const path = options.path ?? '/';
                const pathHash = `${options.type}::${path}`;
                if (pathHashCache.has(pathHash)) {
                    throw new Error(
                            `The endpoint "${pathHash}" is already taken `
                        +   `by \`${target.name}.prototype.${method.name}\``
                    );
                }

                // Create endpoint method
                router[options.type](path, async (req, res, nxt) => {
                    try {
                        const ctrl = new target();
                        await method.bind(ctrl)(req, res, nxt);
                    } catch (err) {
                        console.error(err);
                        if (!res.headersSent) {
                            const status = err instanceof EndpointError
                            ?   err.status
                            :   500;

                            res.status(status);
                            res.contentType('text/plain; charset=utf-8');
                            res.end((err as Error)?.message ?? 'Error not specified');
                        }
                    }
                });
            });

        return router;
    }
}