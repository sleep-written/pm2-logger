import type { Request, Response } from 'express';

import { EndpointDecorator } from './endpoint.decorator.js';
import test from 'node:test';

test('Create a controller', (t: test.TestContext) => {
    const decorator = new EndpointDecorator();

    class FooController {
        @decorator.decorate({ type: 'get' })
        async foo(_: Request, res: Response): Promise<void> {
            res.json({ foo: 'bar' });
        }

        @decorator.decorate({ type: 'put' })
        async bar(_: Request, res: Response): Promise<void> {
            res.json({ bar: 'baz' });
        }
    }

    t.assert.deepEqual(decorator.getEndpoints(FooController), [
        {
            method: FooController.prototype.foo,
            options: { type: 'get' }
        },
        {
            method: FooController.prototype.bar,
            options: { type: 'put' }
        }
    ])
});