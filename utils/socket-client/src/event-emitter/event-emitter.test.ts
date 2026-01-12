import { EventEmitter } from './event-emitter.js';
import test from 'node:test';

test('Create a new EventEmitter', async (t: test.TestContext) => {
    const eventListener = new EventEmitter<{
        open:       [];
        close:      [];
        message:    [ string ];
    }>();

    setTimeout(() => {
        eventListener.dispatchParallel('open');
    }, 500);

    const data = await new Promise<string[]>((resolve, reject) => {
        try {
            const messages: string[] = [];
            eventListener.on('message', message => messages.push(message));

            eventListener.once('open', async () => {
                await new Promise(r => setTimeout(r, 500));
                await eventListener.dispatchSerial('message', 'perreo');

                await new Promise(r => setTimeout(r, 500));
                await eventListener.dispatchSerial('message', 'ijoeputa');

                await new Promise(r => setTimeout(r, 500));
                eventListener.dispatchParallel('close');
            });

            eventListener.once('close', () => {
                eventListener.dispose();
                resolve(messages);
            });
        } catch (err) {
            reject(err);
        }
    });

    t.assert.deepStrictEqual(data, [ 'perreo', 'ijoeputa' ]);
});