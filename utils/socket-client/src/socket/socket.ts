import type { SocketEventMap, SocketInject, WebSocketObject } from './interfaces/index.js';

import { EventEmitter } from '../event-emitter/index.js';
import { SocketStatus } from './socket-status.js';
import { TimeoutError } from './timeout.error.js';

export class Socket<T = any> extends EventEmitter<SocketEventMap<T>> {
    #inject: Required<SocketInject>;
    #socket?: {
        instance:           WebSocketObject;
        openCallback:       () => unknown;
        errorCallback:      () => unknown;
        closeCallback:      (e: CloseEvent) => unknown;
        messageCallback:    (e: MessageEvent<T>) => unknown;
    };

    #status = SocketStatus.CLOSED;
    get status(): SocketStatus {
        return this.#status;
    }

    constructor(inject?: SocketInject) {
        super();
        this.#inject = {
            createSocket:
                inject?.createSocket?.bind(inject) ??
                ((url, protocols) => new WebSocket(url, protocols))
        };
    }

    async connect(
        url: string | URL,
        options?: {
            protocols?: string | string[];
            timeout?: number;
        }
    ): Promise<void> {
        if (this.#socket || this.#status !== SocketStatus.CLOSED) {
            throw new Error(`The socket must be closed before create a connection`);
        }

        try {
            this.#status = SocketStatus.CONNECTING;
            const instance = await new Promise<WebSocketObject>((resolve, reject) => {
                const timeout = options?.timeout;
                const clock = typeof timeout === 'number' && setTimeout(
                    () => {
                        const err = new TimeoutError(timeout);
                        reject(err);
                    },
                    timeout
                );

                const ws = this.#inject.createSocket(url, options?.protocols);
                const openCallback = () => {
                    clock &&
                    clearTimeout(clock);

                    ws.removeEventListener('error', errorCallback);
                    resolve(ws);
                };

                const errorCallback = () => {
                    clock &&
                    clearTimeout(clock);

                    ws.removeEventListener('open', openCallback);
                    reject(new Error(`WebSocket connection to "${url}" failed`));
                };

                ws.addEventListener('open',  openCallback,  { once: true });
                ws.addEventListener('error', errorCallback, { once: true });
            });

            this.#socket = {
                instance,
                messageCallback: e => this.dispatchParallel('message', {
                    data: e.data,
                    ports: e.ports,
                    source: e.source,
                    origin: e.origin,
                    lastEventId: e.lastEventId
                }),
                closeCallback:   e => this.dispatchParallel('close', {
                    code: e.code,
                    reason: e.reason,
                    wasClean: e.wasClean
                }),
                errorCallback:   () => this.dispatchParallel('error'),
                openCallback:    () => this.dispatchParallel('open')
            };

            instance.addEventListener('message',   this.#socket.messageCallback);
            instance.addEventListener('close',     this.#socket.closeCallback);
            instance.addEventListener('error',     this.#socket.errorCallback);
            instance.addEventListener('open',      this.#socket.openCallback);
            this.#status = SocketStatus.OPEN;

        } catch (err) {
            this.#status = SocketStatus.CLOSED;
            this.#socket = undefined;
            throw err;

        }
    }

    async disconnect(
        options?: {
            code?: number;
            reason?: string;
            timeout?: number;
        }
    ): Promise<void> {
        if (!this.#socket || this.#status !== SocketStatus.OPEN) {
            throw new Error(`The socket must be connected before close the connection`);
        }

        const {
            instance,
            openCallback,
            errorCallback,
            closeCallback,
            messageCallback,
        } = this.#socket!;

        try {
            this.#status = SocketStatus.CLOSING;
            await new Promise<void>((resolve, reject) => {
                const timeout = options?.timeout;
                const clock = typeof timeout === 'number' && setTimeout(
                    () => {
                        const err = new TimeoutError(timeout);
                        reject(err);
                    },
                    timeout
                );

                instance.addEventListener('close', () => {
                    clock &&
                    clearTimeout(clock);
                    resolve();
                }, { once: true });
                
                instance.removeEventListener('open',    openCallback);
                instance.removeEventListener('error',   errorCallback);
                instance.removeEventListener('close',   closeCallback);
                instance.removeEventListener('message', messageCallback);
                instance.close(options?.code, options?.reason);
            });

        } catch (err) {
            throw err;

        } finally {
            this.#status = SocketStatus.CLOSED;
            this.#socket = undefined;

        }
    }

    send(message: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>): void {
        if (!this.#socket || this.#status !== SocketStatus.OPEN) {
            throw new Error(`The socket must be connected before send a message`);
        }

        this.#socket.instance.send(message);
    }
}