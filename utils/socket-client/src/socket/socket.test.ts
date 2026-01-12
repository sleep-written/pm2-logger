import type { SocketInject, WebSocketObject } from './interfaces/index.js';

import { TimeoutError } from './timeout.error.js';
import { SocketStatus } from './socket-status.js';
import { Socket } from './socket.js';
import test from 'node:test';

interface InjectOptions {
    noConnect?: boolean;
    noDisconnect?: boolean;
}

class Inject implements SocketInject {
    #options: InjectOptions;

    #sendedMessages: any[] = [];
    get sendedMessages(): any[] {
        return structuredClone(this.#sendedMessages);
    }

    constructor(options?: InjectOptions) {
        this.#options = {
            noConnect: options?.noConnect,
            noDisconnect: options?.noDisconnect,
        }
    }

    createSocket(): WebSocketObject {
        let readyState: number = WebSocket.CLOSED;
        const webSocket = new EventTarget();
        readyState = WebSocket.CONNECTING;
        !this.#options?.noConnect &&
        setTimeout(
            () => {
                readyState = WebSocket.CLOSED;
                webSocket.dispatchEvent(new Event('open'));
            },
            500
        );

        return {
            get readyState() { return readyState },
            removeEventListener: (name, callback) => {
                webSocket.removeEventListener(name, callback as any);
            },
            addEventListener: (name, callback, options) => {
                webSocket.addEventListener(name, callback as any, options);
            },
            close: (code, reason) => {
                readyState = WebSocket.CLOSING;
                !this.#options?.noDisconnect &&
                setTimeout(
                    () => {
                        readyState = WebSocket.OPEN;
                        webSocket.dispatchEvent(new CloseEvent('close', { code, reason }));
                    },
                    500
                );
            },
            send: (data) => {
                this.#sendedMessages.push(data);
                setTimeout(
                    () => webSocket.dispatchEvent(new MessageEvent(
                        'message',
                        { data: `Server response to "${data}": jaja` }
                    )),
                    500
                );
            }
        };
    }
}

test('Create a Socket instance', async (t: test.TestContext) => {
    const receivedMessages: any[] = [];
    const inject = new Inject();
    const socket = new Socket(inject);

    t.assert.strictEqual(socket.status, SocketStatus.CLOSED);
    await socket.connect('ws://localhost');
    t.assert.strictEqual(socket.status, SocketStatus.OPEN);
    socket.on('message', e => receivedMessages.push(e.data));

    await new Promise(r => setTimeout(r, 500));
    socket.send('perreo');
    await new Promise(r => setTimeout(r, 500));
    socket.send('ijoeputa');

    await new Promise(r => setTimeout(r, 2000));
    t.assert.strictEqual(socket.status, SocketStatus.OPEN);
    await socket.disconnect();
    t.assert.strictEqual(socket.status, SocketStatus.CLOSED);

    socket.dispose();
    t.assert.deepStrictEqual(inject.sendedMessages, [
        'perreo',
        'ijoeputa',
    ]);
    t.assert.deepStrictEqual(receivedMessages, [
        'Server response to "perreo": jaja',
        'Server response to "ijoeputa": jaja',
    ]);
});

test('Create a Socket instance, timeout on connect', async (t: test.TestContext) => {
    const inject = new Inject({ noConnect: true });
    const socket = new Socket(inject);

    try {
        t.assert.strictEqual(socket.status, SocketStatus.CLOSED);
        await socket.connect('ws://localhost', { timeout: 1000 });
        t.assert.fail('This test must fail');
    } catch (err) {
        t.assert.strictEqual(socket.status, SocketStatus.CLOSED);
        t.assert.ok(err instanceof TimeoutError);
    } finally {
        socket.dispose();
    }
});

test('Create a Socket instance, timeout on disconnect', async (t: test.TestContext) => {
    const inject = new Inject({ noDisconnect: true });
    const socket = new Socket(inject);

    t.assert.strictEqual(socket.status, SocketStatus.CLOSED);
    await socket.connect('ws://localhost', { timeout: 1000 });
    
    try {
        t.assert.strictEqual(socket.status, SocketStatus.OPEN);
        await socket.disconnect({ timeout: 500 });
        t.assert.fail('This test must fail');
    } catch (err) {
        t.assert.strictEqual(socket.status, SocketStatus.CLOSED);
        t.assert.ok(err instanceof TimeoutError);
    } finally {
        socket.dispose();
    }
});