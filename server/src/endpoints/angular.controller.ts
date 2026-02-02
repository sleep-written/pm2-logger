import type { Request, Response } from 'express';

import { resolve } from 'path';
import { Server } from '@utils/server';
import { stat } from 'fs/promises';

export class AngularController {
    static #paths = new Map<string, string>();

    async #buildPath(req: { path: string }): Promise<string> {
        if (AngularController.#paths.has(req.path)) {
            return AngularController.#paths.get(req.path)!;
        }

        const root = resolve(
            import.meta.dirname,
            '../../../client/dist/client/browser'
        );

        try {
            const relative = req.path.slice(1) ?? 'index.html';
            const fullPath = resolve(root, relative);
            const dirent = await stat(fullPath);
            if (!dirent.isFile()) {
                throw new Error();
            }

            AngularController.#paths.set(req.path, fullPath);
            return fullPath;
        } catch {
            const fullPath = resolve(root, 'index.html');
            AngularController.#paths.set(req.path, fullPath);
            return fullPath;
        }
    }

    @Server.endpoint({ type: 'get', path: '*all' })
    async get(req: Request, res: Response): Promise<void> {
        const fullPath = await this.#buildPath(req);
        res.sendFile(fullPath);
    }
}