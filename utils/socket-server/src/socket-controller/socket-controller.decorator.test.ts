import type { SocketController } from './interfaces/index.js';
import type WebSocket from 'ws';

import { SocketControllerDecorator } from './socket-controller.decorator.js';
import test from 'node:test';

test('Create a socket controller', (t: test.TestContext) => {
    const decorator = new SocketControllerDecorator();

    @decorator.decorate({ path: '/log' })
    class LogController implements SocketController {
        declare socket: WebSocket;

        onMessage(_: WebSocket.RawData): void {
            this.socket.send('caca');
        }
    }

    t.assert.deepEqual(decorator.getOptions(LogController), {
        path: '/log'
    });
});