export class DisposedEventListenerError extends Error {
    constructor() {
        super(`The current "EventListener" instance has already disposed`);
    }
}