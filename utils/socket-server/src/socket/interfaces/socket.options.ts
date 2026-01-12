import type { SocketController } from '../../socket-controller/index.js';

export interface SocketOptions {
    events: (new() => SocketController)[];
}