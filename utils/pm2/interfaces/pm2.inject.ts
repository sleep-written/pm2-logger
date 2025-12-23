import type { ChildProcess } from './child-process.ts';
import type { SpawnSyncResponse } from './spawn-sync.response.ts';

export interface PM2Inject {
    spawnSync?(
        command: string,
        args: string[],
        opts: {
            encoding: BufferEncoding;
        }
    ): SpawnSyncResponse;

    spawn?(
        command: string,
        args: string[],
        opts: {
            signal: AbortSignal,
            shell?: boolean
        }
    ): ChildProcess;
}