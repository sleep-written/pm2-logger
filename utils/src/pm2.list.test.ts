import type { PM2Inject, SpawnSyncResponse } from './interfaces/index.ts';

import { PM2 } from './pm2.ts';
import test from 'node:test';

class Inject implements PM2Inject {
    #commands: Record<string, string> = {
        jlist: JSON.stringify([
            {
                pid:    666,
                name:   'devil',
                pm_id: 1,
                monit: {
                    memory: 6666,
                    cpu:    1.5
                }
            },
            {
                pid:    999,
                name:   'demiurgo',
                pm_id: 2,
                monit: {
                    memory: 9999,
                    cpu:    5.1
                }
            }
        ])
    };

    spawnSync(_: string, [ command ]: string[]): SpawnSyncResponse {
        const stdout = this.#commands[command];
        if (typeof stdout !== 'string') {
            return {
                status: 666,
                stderr: `Command "${command}" not found`,
                stdout: ''
            }
        }

        return {
            status: 0,
            stderr: '',
            stdout
        };
    }
}

test('List all process', t => {
    const inject = new Inject();
    const pm2 = new PM2(inject);
    const res = pm2.list();
    t.assert.deepEqual(res, [
        {
            id:     1,
            pid:    666,
            name:   'devil',
            monit: {
                memory: 6666,
                cpu:    1.5
            }
        },
        {
            id:     2,
            pid:    999,
            name:   'demiurgo',
            monit: {
                memory: 9999,
                cpu:    5.1
            }
        }
    ]);
});