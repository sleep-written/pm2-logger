import type { SocketController, SocketControllerOptions } from './interfaces/index.js';

export class SocketControllerDecorator {
    #cache = new WeakMap<new() => SocketController, SocketControllerOptions>();

    decorate(options: SocketControllerOptions) {
        return (target: new() => SocketController) => {
            this.#cache.set(target, options);
        };
    }

    getOptions(target: new() => SocketController): SocketControllerOptions | undefined {
        return this.#cache.get(target);
    }
}