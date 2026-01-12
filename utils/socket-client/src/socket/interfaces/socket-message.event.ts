export interface SocketMessageEvent<T> {
    data: T;
    lastEventId: string;
    origin: string;
    ports: ReadonlyArray<MessagePort>;
    source: MessageEventSource | null;
}