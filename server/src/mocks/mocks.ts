import { styleText } from 'node:util';
import { Server } from '@pm2-logger/utils-server';

import { PM2Mock, type PM2Object } from './pm2/index.js';
import { PM2 } from '@pm2-logger/utils-pm2';

export class Mocks {
    #callbacks: Record<string, () => void> = {
        pm2: () => {
            Server.factory<PM2Object>(PM2, () => new PM2Mock());
        }
    };

    #mocks: string[];

    constructor(mocks: string[]) {
        this.#mocks = mocks;
    }

    execute(): void {
        Object
            .entries(this.#callbacks)
            .filter(([ k ]) => this.#mocks?.includes(k))
            .forEach(([ name, callback ]) => {
                callback();

                const styledName = styleText('greenBright', `"${name}"`);
                console.log(`Factory ${styledName} was mocked!`);
            });
    }
}