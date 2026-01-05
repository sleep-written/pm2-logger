import type { IncomingMessage } from 'node:http';
import type WebSocket from 'ws';

export interface SocketControllerContext {
    socket: WebSocket;
    request: IncomingMessage;
}