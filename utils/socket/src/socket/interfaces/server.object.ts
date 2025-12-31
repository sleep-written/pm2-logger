import type { IncomingMessage } from 'node:http';
import type Stream from 'node:stream';

export interface ServerObject {
    on(
        name: 'upgrade',
        callback: (
            req: IncomingMessage,
            res: Stream.Duplex,
            head: Buffer
        ) => unknown
    ): ServerObject;
}