export interface PM2Process {
    id:     number;
    name:   string;
    pid:    number;
    monit: {
        cpu:    number;
        memory: number;
    }
}