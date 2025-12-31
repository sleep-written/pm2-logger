import type { SocketController, SocketControllerOptions } from '../socket-controller/index.js';
import type { ServerObject, SocketOptions } from './interfaces/index.js';
import type { Server } from 'node:http';

import { SocketControllerDecorator } from '../socket-controller/index.js';
import WebSocket, { WebSocketServer } from 'ws';

export class Socket {
    static #decorator = new SocketControllerDecorator();

    static event(options: SocketControllerOptions) {
        return this.#decorator.decorate(options);
    }

    #options: SocketOptions;

    constructor(options: SocketOptions) {
        this.#options = options;
    }

    #deployTarget(webSocket: WebSocket, target: new() => SocketController): void {
        class Control extends target {
            socket = webSocket;
        }

        const ctrl = new Control();

        ctrl.onClose &&
        webSocket.on('close', ctrl.onClose.bind(ctrl));

        ctrl.onError &&
        webSocket.on('error', ctrl.onError.bind(ctrl));

        ctrl.onMessage &&
        webSocket.on('message', ctrl.onMessage.bind(ctrl));

        ctrl.onPing &&
        webSocket.on('ping', ctrl.onPing.bind(ctrl));

        ctrl.onPong &&
        webSocket.on('pong', ctrl.onPong.bind(ctrl));

        ctrl.onRedirect &&
        webSocket.on('redirect', ctrl.onRedirect.bind(ctrl));

        ctrl.onUnexpectedResponse &&
        webSocket.on('unexpected-response', ctrl.onUnexpectedResponse.bind(ctrl));
    }

    use(server: Server, path?: string): void {
        const webSocket = new WebSocketServer({ server, path });
        webSocket.on('connection', (ws, req) => {
            const { target } = this.#options.events
                .map(target => {
                    const options = Socket.#decorator.getOptions(target);
                    return options
                    ?   [{ target, options }]
                    :   [];
                })
                .flat()
                .find(({ options }) => (options.path ?? '/') === (req.url ?? '/')) ?? {};

            if (target) {
                this.#deployTarget(ws, target);
            }
        });
    }
}