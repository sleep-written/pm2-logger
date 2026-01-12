export interface SocketCloseEvent {
    code?: number;
    reason?: string;
    wasClean?: boolean;
}