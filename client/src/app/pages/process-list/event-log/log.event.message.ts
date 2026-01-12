export interface LogEventMessage {
    name: 'heartbeat' | 'log-message';
    value: string;
}