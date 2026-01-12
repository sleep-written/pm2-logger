import type { EventCallback } from './interfaces/index.js';
import { DisposedEventListenerError } from './disposed-event-emitter.error.js';

export class EventEmitter<T extends { [K in keyof T]: unknown[]; }> {
    #disposed = false;
    #once:      { [K in keyof T]?: Set<EventCallback<T[K]>>; } = {};
    #on:        { [K in keyof T]?: Set<EventCallback<T[K]>>; } = {};

    #assertDispose(): void {
        if (this.#disposed) {
            throw new DisposedEventListenerError();
        }
    }

    once<K extends keyof T>(name: K, callback: EventCallback<T[K]>): EventEmitter<T> {
        this.#assertDispose();
        if (!this.#once[name]) {
            this.#once[name] = new Set();
        }

        this.#once[name].add(callback);
        return this;
    }

    on<K extends keyof T>(name: K, callback: EventCallback<T[K]>): EventEmitter<T> {
        this.#assertDispose();
        if (!this.#on[name]) {
            this.#on[name] = new Set();
        }

        this.#on[name].add(callback);
        return this;
    }

    off<K extends keyof T>(name: K, callback: EventCallback<T[K]>): EventEmitter<T> {
        this.#assertDispose();
        this.#once[name]?.delete(callback);
        this.#on[name]?.delete(callback);
        return this;
    }

    #getSnapshot<K extends keyof T>(name: K): EventCallback<T[K]>[] {
        this.#assertDispose();
        const set = new Set([
            ...Array.from(this.#once[name] ?? []),
            ...Array.from(this.#on[name] ?? []),
        ]);

        return Array.from(set);
    }

    async #executeCallback<K extends keyof T>(
        name: K,
        callback: EventCallback<T[K]>,
        values: T[K]
    ): Promise<void> {
        try {
            await callback(...values);
        } catch (err) {
            /**
             * Los eventos de Node nativo notifican el error, pero sus dispatcher siguen vivos.
             * Así que no sean maricas e implementen control de fallos en sus propios callbacks
             * hijos de la gran perra jaja
             */
            console.error(err);
        } finally {
            this.#once[name]?.delete(callback);
        }
    }

    async dispatchParallel<K extends keyof T>(name: K, ...values: T[K]): Promise<void> {
        this.#assertDispose();
        const snapshot = this
            .#getSnapshot(name)
            .map(callback => this.#executeCallback(
                name,
                callback,
                values
            ));

        await Promise.all(snapshot);
    }

    async dispatchSerial<K extends keyof T>(name: K, ...values: T[K]): Promise<void> {
        this.#assertDispose();
        for (const callback of this.#getSnapshot(name)) {
            await this.#executeCallback(name, callback, values);
        }
    }

    dispose(): void {
        this.#disposed = true;
        this.#once = {};
        this.#on = {};
    }
}