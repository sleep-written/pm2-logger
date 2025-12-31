import type { SocketController } from '@pm2-logger/utils-socket';
import type WebSocket from 'ws';

import { Socket } from '@pm2-logger/utils-socket';

@Socket.event({ path: '/foo/bar' })
export class LogEvent implements SocketController {
    declare socket: WebSocket;

    onMessage?(data: WebSocket.RawData): void {
        console.log('message:', data.toString('utf-8'));
        this.socket.send('jajaja');
    }
}