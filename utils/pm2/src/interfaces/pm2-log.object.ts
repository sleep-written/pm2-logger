export interface PM2LogObject {
    controller: AbortController;
    execute(): Promise<void>;
}