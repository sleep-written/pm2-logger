export interface ChildProcessStream {
    on(
        name: 'data',
        callback: (chunk: Buffer) => unknown
    ): void;
}