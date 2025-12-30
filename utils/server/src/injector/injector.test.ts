import { Injector } from './injector.js';
import test from 'node:test';

test('Inject simple data', (t: test.TestContext) => {
    interface Person {
        greeting(): string;
    }

    class Soldier implements Person {
        #name: string;
        get name(): string {
            return this.#name;
        }

        constructor(name: string) {
            this.#name = name;
        }

        greeting(): string {
            return `Hi, i'm ${this.#name}!`;
        }

        goodbye(): string {
            return `Oyasumi!`;
        }
    }

    const injector = new Injector();
    injector.factory<Person>(Soldier, () => new Soldier('Stella'));
    const stella = injector.inject<Person>(Soldier);
    t.assert.strictEqual(stella.greeting(), `Hi, i'm Stella!`);

    injector.factory<Person>(Soldier, () => ({
        greeting: () => `jajaja`
    }));

    const vektor = injector.inject<Person>(Soldier);
    t.assert.strictEqual(vektor.greeting(), `jajaja`);
});