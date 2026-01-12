export interface WebSocketObject {
    readyState: number;
    addEventListener<K extends keyof WebSocketEventMap>(
        name: K,
        callback: (e: WebSocketEventMap[K]) => unknown,
        options?: { once?: boolean }
    ): void;

    removeEventListener<K extends keyof WebSocketEventMap>(
        name: K,
        callback: (e: WebSocketEventMap[K]) => unknown
    ): void;

    send(data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>): void;
    close(code?: number, reason?: string): void;
}