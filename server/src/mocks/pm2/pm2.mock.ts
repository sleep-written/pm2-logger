import type { PM2Process, PM2LogObject } from '@pm2-logger/utils-pm2';
import type { PM2Object } from './pm2.object.js';

export class PM2Mock implements PM2Object {
    #processList: PM2Process[] = [
        {
            id: 1,
            pid: 666,
            name: '@soldier/stella',
            monit: {
                cpu: 99,
                memory: 60128
            }
        },
        {
            id: 2,
            pid: 999,
            name: '@soldier/vektor',
            monit: {
                cpu: 99,
                memory: 60128
            }
        }
    ];

    list(): PM2Process[] {
        return structuredClone(this.#processList);
    }

    #randomBits(length: number): string {
        return Math
            .round(Math.random() * (2**length))
            .toString(2)
            .padStart(length, '0');
    }

    log(
        id: number,
        stdout: (c: Buffer) => unknown
    ): PM2LogObject {
        const process = this.#processList.find(x => x.id === id);
        if (!process) {
            throw new Error(`The pm2 process id "${id}" doesn't exists`);
        }

        const controller = new AbortController();
        const execute = async () => {
            const { signal } = controller;
            while (!signal.aborted) {
                const line = [
                    `${process.name} -> `,
                    this.#randomBits(16)
                ];
                
                const buffer = Buffer.from(line.join(''), 'utf-8');
                stdout(buffer);
                await new Promise(r => setTimeout(r, 1000));
            }
        };

        return { controller, execute };
    }
}