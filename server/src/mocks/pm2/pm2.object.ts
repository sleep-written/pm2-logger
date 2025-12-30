import type { PM2Process, PM2LogObject } from '@pm2-logger/utils-pm2';

export interface PM2Object {
    list(): PM2Process[];
    log(id: number, stdout: (c: Buffer) => unknown): PM2LogObject;
}