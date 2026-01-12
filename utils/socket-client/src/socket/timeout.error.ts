export class TimeoutError extends Error {
    constructor(timeout: number) {
        super(`The timeout has been exceded (${timeout} ms)`);
    }
}