import type { SocketEventMap, SocketInject, WebSocketObject } from './interfaces/index.js';

import { EventEmitter } from '../event-emitter/index.js';
import { SocketStatus } from './socket-status.js';
import { TimeoutError } from './timeout.error.js';

export class Socket<T = any> extends EventEmitter<SocketEventMap<T>> {
    #inject: Required<SocketInject>;
    #socket?: {
        instance:   WebSocketObject;
        open:       () => unknown;
        error:      () => unknown;
        close:      (e: CloseEvent) => unknown;
        message:    (e: MessageEvent<T>) => unknown;
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
                ws.addEventListener('open', () => {
                    clock &&
                    clearTimeout(clock);
                    resolve(ws);
                }, { once: true });
            });

            this.#socket = {
                instance,
                message:   e => this.dispatchParallel('message', {
                    data: e.data,
                    lastEventId: e.lastEventId,
                    origin: e.origin,
                    ports: e.ports,
                    source: e.source
                }),
                close:     e => this.dispatchParallel('close', {
                    code: e.code,
                    reason: e.reason,
                    wasClean: e.wasClean
                }),
                error:     () => this.dispatchParallel('error'),
                open:      () => this.dispatchParallel('open')
            };

            instance.addEventListener('message',   this.#socket.message);
            instance.addEventListener('close',     this.#socket.close);
            instance.addEventListener('error',     this.#socket.error);
            instance.addEventListener('open',      this.#socket.open);
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

                this.#socket!.instance.close(options?.code, options?.reason);
                this.#socket!.instance.addEventListener('close', () => {
                    clock &&
                    clearTimeout(clock);
                    resolve();
                }, { once: true });
            });
    
            this.#socket.instance.removeEventListener('open',    this.#socket.open);
            this.#socket.instance.removeEventListener('error',   this.#socket.error);
            this.#socket.instance.removeEventListener('close',   this.#socket.close);
            this.#socket.instance.removeEventListener('message', this.#socket.message);
            this.#status = SocketStatus.CLOSED;
            this.#socket = undefined;

        } catch (err) {
            if (this.#socket?.instance && this.#socket.instance.readyState !== WebSocket.OPEN) {
                this.#status = SocketStatus.CLOSED;
                this.#socket = undefined;
            }

            throw err;

        }
    }

    send(message: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>): void {
        if (!this.#socket || this.#status !== SocketStatus.OPEN) {
            throw new Error(`The socket must be connected before send a message`);
        }

        this.#socket.instance.send(message);
    }
}