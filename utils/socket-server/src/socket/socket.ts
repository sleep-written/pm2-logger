import type { SocketController, SocketControllerOptions } from '../socket-controller/index.js';
import type { IncomingMessage, Server } from 'node:http';
import type { SocketOptions } from './interfaces/index.js';

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

    #deployTarget(
        socket: WebSocket,
        request: IncomingMessage,
        target: new() => SocketController
    ): void {
        const ctrl = new target();

        ctrl.onClose &&
        socket.on('close', ctrl.onClose.bind(ctrl));

        ctrl.onError &&
        socket.on('error', ctrl.onError.bind(ctrl));

        ctrl.onMessage &&
        socket.on('message', ctrl.onMessage.bind(ctrl));

        ctrl.onPing &&
        socket.on('ping', ctrl.onPing.bind(ctrl));

        ctrl.onPong &&
        socket.on('pong', ctrl.onPong.bind(ctrl));

        ctrl.onRedirect &&
        socket.on('redirect', ctrl.onRedirect.bind(ctrl));

        ctrl.onUnexpectedResponse &&
        socket.on('unexpected-response', ctrl.onUnexpectedResponse.bind(ctrl));

        ctrl.onInit &&
        ctrl.onInit({ socket, request });
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
                .find(({ options }) => {
                    const reqUrl = new URL(req.url ?? '/', 'ws://localhost');
                    const curUrl = new URL(options.path ?? '/', 'ws://localhost');
                    return reqUrl.pathname === curUrl.pathname;
                }) ?? {};

            if (target) {
                this.#deployTarget(ws, req, target);
            }
        });
    }
}