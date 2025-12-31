import type { EndpointOptions, RouterOptions } from './interfaces/index.js';

import { EndpointDecorator } from './endpoint.decorator.js';
import { RouterGenerator } from './router.generator.js';
import { Injector } from '../injector/index.js';
import express from 'express';

export class Server {
    static #endpointDecorator = new EndpointDecorator();
    static #routerGenerator = new RouterGenerator(Server.#endpointDecorator);
    static #injector = new Injector();

    static endpoint(options: EndpointOptions) {
        return Server.#endpointDecorator.decorate(options);
    }

    static router(options: RouterOptions<express.Router>) {
        return Server.#routerGenerator.generate(options);
    }

    static get factory() {
        return Server.#injector.factory.bind(Server.#injector);
    }

    static get inject() {
        return Server.#injector.inject.bind(Server.#injector);
    }
}