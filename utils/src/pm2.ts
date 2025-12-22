import type { PM2Inject, PM2Process, PM2ProcessRaw } from './interfaces/index.ts';
import { spawn, spawnSync } from 'node:child_process';

export class PM2 {
    #inject: Required<PM2Inject>;

    constructor(inject?: PM2Inject) {
        this.#inject = {
            spawnSync:  inject?.spawnSync?.bind(inject) ?? spawnSync,
            spawn:      inject?.spawn?.bind(inject)     ?? spawn,
        };
    }

    list(): PM2Process[] {
        const resp = this.#inject.spawnSync(
            'pm2', [ 'jlist' ],
            { encoding: 'utf-8' }
        );

        if (resp.status !== 0) {
            throw resp.error
            ?   resp.error
            :   new Error(resp.stderr);
        }

        const json = JSON.parse(resp.stdout) as PM2ProcessRaw[];
        return json.map(x => ({
            id: x.pm_id,
            pid: x.pid,
            name: x.name,
            monit: {
                cpu: x.monit.cpu,
                memory: x.monit.memory
            }
        } as PM2Process));
    }

    log(
        id: number,
        stdout:  (c: Buffer) => unknown,
        stderr?: (c: Buffer) => unknown
    ): {
        controller: AbortController;
        execute(): Promise<void>;
    };

    log(
        process: PM2Process,
        stdout:  (c: Buffer) => unknown,
        stderr?: (c: Buffer) => unknown
    ): {
        controller: AbortController;
        execute(): Promise<void>;
    };

    log(
        arg: number | PM2Process,
        stdout:  (c: Buffer) => unknown,
        stderr?: (c: Buffer) => unknown
    ): {
        controller: AbortController;
        execute(): Promise<void>;
    } {
        const id = typeof arg !== 'number'
        ?   arg.id
        :   arg;

        const controller = new AbortController();
        const execute = () => new Promise<void>((resolve, reject) => {
            const process = this.#inject.spawn(
                'pm2', [ 'log', '--raw', id.toString() ],
                { signal: controller.signal }
            );

            let error: Error | undefined;
            process.on('close', () => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });

            process.on('error', err => {
                error = err;
                controller.abort();
            });

            process.stdout.on('data', async (chunk: Buffer) => {
                try {
                    await stdout(chunk);
                } catch (err: any) {
                    error = err;
                    controller.abort();
                }
            });

            process.stderr.on('data', async (chunk: Buffer) => {
                try {
                    if (stderr) {
                        await stderr(chunk);
                    } else {
                        await stdout(chunk);
                    }
                } catch (err: any) {
                    error = err;
                    controller.abort();
                }
            });
        });

        return { controller, execute };
    }
}