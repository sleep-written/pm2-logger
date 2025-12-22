import type { ChildProcess, ChildProcessStream, PM2Inject, SpawnSyncResponse } from './interfaces/index.ts';

import { PM2 } from './pm2.ts';
import test from 'node:test';

class EGirlStreamer implements ChildProcessStream {
    #messages: string[];
    #callbacks = new Set<(chunk: Buffer) => unknown>();

    constructor(messages: string[]) {
        this.#messages = messages;
    }

    on(_: 'data', callback: (chunk: Buffer) => unknown): void {
        this.#callbacks.add(callback);
    }

    initialize(): void {
        for (const message of this.#messages) {
            const chunk = Buffer.from(message, 'utf-8');
            for (const callback of this.#callbacks) {
                callback(chunk);
            }
        }
    }
}

class AngelicProcess implements ChildProcess {
    #events = new Map<string, Set<(...a: any[]) => unknown>>();
    stdout: EGirlStreamer;
    stderr: EGirlStreamer;

    constructor(
        stdout: string[],
        stderr: string[],
        signal: AbortSignal
    ) {
        this.stdout = new EGirlStreamer(stdout);
        this.stderr = new EGirlStreamer(stderr);

        signal.addEventListener('abort', () => {
            const code = stderr.length > 0 ? 666 : 0;
            for (const callback of this.#events.get('close') ?? []) {
                callback(code);
            }
        });
    }

    on(name: 'close', callback: (code?: number) => unknown): void;
    on(name: 'error', callback: (err: Error) => unknown): void;
    on(name: string,  callback: (...a: any[]) => unknown): void {
        const callbacks = this.#events.get(name) ?? new Set();
        callbacks.add(callback);
        this.#events.set(name, callbacks);
    }

    emit(name: 'close', code?: number): void;
    emit(name: 'error', error: Error): void;
    emit(name: string, ...args: unknown[]): void {
        for (const callback of this.#events.get(name) ?? []) {
            callback(...args);
        }
    }
}

class Inject implements PM2Inject {
    #error?: Error;
    #logs: Record<number, string[]> = {
        1: [
            'hola mundo',
            'cosme fulanito'
        ],
        2: [
            'la navidad es la orgía religiosa por excelencia',
            'perreo ijoeputaaaa',
            'chao pescado'
        ]
    };

    constructor(error?: Error) {
        this.#error = error;
    }

    spawn(
        _: string,
        [ __, ___, processId ]: string[],
        { signal }: { signal: AbortSignal }
    ): AngelicProcess {
        const messages = this.#logs[parseInt(processId)];
        const process = !messages
        ?   new AngelicProcess([], [ `Process "${processId}" not found` ], signal)
        :   new AngelicProcess(messages, [], signal);

        setTimeout(
            () => {
                if (this.#error) {
                    process.emit('error', this.#error);
                } else {
                    process.stdout.initialize();
                    process.stderr.initialize();
                }
            },
            1000
        )
        
        return process;
    }
}

test('Get logs for process id "1"', async (t: test.TestContext) => {
    const inject = new Inject();
    const pm2 = new PM2(inject);

    const logs: string[] = [];
    const { controller, execute } = pm2.log(1, chunk => {
        const message = chunk.toString('utf-8');
        logs.push(message);
    });

    setTimeout(
        () => controller.abort(),
        2000
    );

    await execute();
    t.assert.deepEqual(logs, [
        'hola mundo',
        'cosme fulanito'
    ]);
});

test('Get logs for process id "2"', async (t: test.TestContext) => {
    const inject = new Inject();
    const pm2 = new PM2(inject);

    const logs: string[] = [];
    const { controller, execute } = pm2.log(2, chunk => {
        const message = chunk.toString('utf-8');
        logs.push(message);
    });

    setTimeout(
        () => controller.abort(),
        2000
    );

    await execute();
    t.assert.deepEqual(logs, [
        'la navidad es la orgía religiosa por excelencia',
        'perreo ijoeputaaaa',
        'chao pescado'
    ]);
});

test('Get logs for process id "3" (not exists)', async (t: test.TestContext) => {
    const inject = new Inject();
    const pm2 = new PM2(inject);
    const logs = {
        stdout: [] as string[],
        stderr: [] as string[],
    };

    const { controller, execute } = pm2.log(
        3,
        chunk => {
            const message = chunk.toString('utf-8');
            logs.stdout.push(message);
        },
        chunk => {
            const message = chunk.toString('utf-8');
            logs.stderr.push(message);
        }
    );

    setTimeout(
        () => controller.abort(),
        2000
    );

    await execute();
    t.assert.deepEqual(logs, {
        stdout: [],
        stderr: [ `Process "3" not found` ]
    });
});

test('Get logs for process id "9" (command doesn\'t exists)', async (t: test.TestContext) => {
    const inject = new Inject(new Error('Command NOT FOUND'));
    const pm2 = new PM2(inject);
    const logs: string[] = [];

    const { execute } = pm2.log(9, chunk => {
        const message = chunk.toString('utf-8');
        logs.push(message);
    });

    try {
        await execute();
        t.assert.fail('The test must be fail');
    } catch (err: any) {
        t.assert.strictEqual(err?.message, 'Command NOT FOUND');
    }
});