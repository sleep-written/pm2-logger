export interface PM2ProcessRaw {
    pm_id: number;
    pid: number;
    name: string;
    monit: {
        cpu: number;
        memory: number;
    };
}