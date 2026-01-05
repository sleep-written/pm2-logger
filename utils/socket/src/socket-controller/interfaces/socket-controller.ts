import type { ClientRequest, IncomingMessage } from 'node:http';
import type { SocketControllerContext } from './socket-controller.context.js';
import type { WebSocket } from 'ws';

export interface SocketController {
    onInit?(context: SocketControllerContext): void;
    onClose?(code: number, reason: Buffer): void;
    onError?(error: Error): void;
    onMessage?(data: WebSocket.RawData, isBinary: boolean): void;
    onPing?(data: Buffer): void;
    onPong?(data: Buffer): void;
    onRedirect?(url: string, request: ClientRequest): void;
    onUnexpectedResponse?(request: ClientRequest, response: IncomingMessage): void;
}