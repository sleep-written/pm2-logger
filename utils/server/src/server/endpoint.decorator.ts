import type { EndpointOptions, HTTPMethodCallback } from './interfaces/index.js';
import type { Request, Response } from 'express';

export class EndpointDecorator {
    #sort = 0;
    #cache = new WeakMap<HTTPMethodCallback, {
        options: EndpointOptions;
        sort: number;
    }>();

    decorate(options: EndpointOptions) {
        return (
            target: Record<string, any>,
            name: string,
            _: TypedPropertyDescriptor<(
                req: Request,
                res: Response
            ) => any>
        ) => {
            this.#cache.set(target[name], {
                options,
                sort: this.#sort++
            });
        };
    }

    getEndpoints(target: new() => unknown): { method: HTTPMethodCallback; options: EndpointOptions }[] {
        const out: {
            method: HTTPMethodCallback;
            options: EndpointOptions;
            sort: number;
        }[] = [];

        let prototype = target.prototype;
        while (prototype && prototype !== Object.prototype) {
            Object
                .getOwnPropertyNames(prototype)
                .map(x => prototype[x])
                .filter(x => typeof x === 'function')
                .forEach(method => {
                    const result = this.#cache.get(method);
                    if (result) {
                        out.push({ method, ...result });
                    }
                });

            prototype = Object.getPrototypeOf(prototype);
        }

        return out
            .sort((a, b) => a.sort - b.sort)
            .map(({ method, options }) => ({ method, options }));
    }
}