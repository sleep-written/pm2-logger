import type { PM2ProcessMonit } from './pm2-process-monit.ts';

export interface PM2Process {
    id: number;
    pid: number;
    name: string;
    monit: PM2ProcessMonit;
}