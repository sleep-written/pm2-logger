import type { Token } from './token.js';

export class Injector {
    #data = new WeakMap<
        new(...args: any) => any,
        () => any
    >();

    factory<T>(
        key: new(...args: any) => T,
        factory: () => T
    ): void {
        this.#data.set(key, factory);
    }

    inject<T>(token: Token<T>): T {
        const callback = this.#data.get(token);
        if (!callback) {
            if (typeof token === 'function' && token.length === 0) {
                return new token();
            }

            throw new Error(`No provider registered for ${token.name ?? '<anonymous>'}`);
        }

        return callback();
    }
}