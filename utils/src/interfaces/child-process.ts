import type { ChildProcessStream } from './child-process-stream.ts';

export interface ChildProcess {
    on(
        name: 'error',
        callback: (err: Error) => unknown
    ): void;

    on(
        name: 'close',
        callback: (code?: number) => unknown
    ): void;

    stdout: ChildProcessStream;
    stderr: ChildProcessStream;
}