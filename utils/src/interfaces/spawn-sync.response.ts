export interface SpawnSyncResponse {
    error?: Error;
    status: number | null;
    stdout: string;
    stderr: string;
}