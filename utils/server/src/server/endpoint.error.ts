export class EndpointError extends Error {
    #status: number;
    get status(): number {
        return this.#status;
    }

    constructor(message: string, status?: number, cause?: unknown) {
        super(message, { cause });
        this.#status = status ?? 500;
    }
}