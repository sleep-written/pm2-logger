import type { SocketController, SocketControllerContext } from '@pm2-logger/utils-socket-server';
import type { LogEventMessage } from './log.event.message.js';
import type WebSocket from 'ws';

import { Socket } from '@pm2-logger/utils-socket-server';
import { Server } from '@pm2-logger/utils-server';
import { PM2 } from '@pm2-logger/utils-pm2';

@Socket.event({ path: '/pm2/log' })
export class LogEvent implements SocketController {
    controller?: AbortController;
    context!: SocketControllerContext;
    pm2 = Server.inject(PM2);

    onInit(context: SocketControllerContext): void {
        this.context = context;

        try {
            const url = new URL(this.context.request.url ?? '/', 'ws://localhost');
            const processId = parseInt(url.searchParams.get('process-id') ?? 'nan');
            if (isNaN(processId)) {
                throw new Error('query param "process-id" must be an valid integer');
            }

            const { controller, execute } = this.pm2.log(
                processId,
                this.onStdout.bind(this),
                this.onStderr.bind(this)
            );

            this.controller = controller;
            execute();
        } catch (err: any) {
            this.context.socket.close(1003, 'query param "process-id" must be an valid integer');
        }
    }

    #sendMessage(name: string, value?: any): void {
        const text = JSON.stringify({ name, value });
        this.context.socket.send(text);
    }

    onStdout(chunk: Buffer): void {
        this.#sendMessage(
            'stdout',
            chunk.toString('utf-8')
        );
    }

    onStderr(chunk: Buffer): void {
        this.#sendMessage(
            'stderr',
            chunk.toString('utf-8')
        );
    }

    onMessage(data: WebSocket.RawData): void {
        try {
            const text = data.toString('utf-8');
            const json: LogEventMessage = JSON.parse(text);

            switch (json.name) {
                case 'heartbeat': {
                    return this.#sendMessage('heartbeat');
                }

                default: {
                    throw new Error(`jajajjAJ el evento de nombre "${json.name}" no existe, pedazo de pendejo`);
                }
            }

        } catch (err: any) {
            console.error(err);
        }
    }

    onClose(): void {
        this.controller?.abort();
    }
}