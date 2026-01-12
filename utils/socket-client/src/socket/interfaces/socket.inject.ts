import type { WebSocketObject } from './web-socket.object.js';

export interface SocketInject {
    createSocket?(
        url: string | URL,
        protocols?: string | string[]
    ): WebSocketObject
}