import type { SocketCloseEvent } from './socket-close.event.js';
import type { SocketMessageEvent } from './socket-message.event.js';

export interface SocketEventMap<T> {
    open:       [];
    error:      [];
    close:      [ e: SocketCloseEvent ];
    message:    [ e: SocketMessageEvent<T> ];
}