import { normalize, resolve } from 'node:path';
import { stat } from 'node:fs/promises';
import express from 'express';

const root = resolve(
    import.meta.dirname,
    '../../..',
    'client/dist/client/browser'
);

async function resolveStaticPath(path: string): Promise<string> {
    try {
        const fullPath = normalize(root + path);
        const dirent = await stat(fullPath);
        return !dirent.isFile()
        ?   resolve(root, 'index.html')
        :   fullPath;
    } catch {
        return resolve(root, 'index.html');
    }
}

export const clientController = express.Router();
clientController.get('*all', async (req, res) => {
    const path = await resolveStaticPath(req.path);
    res.sendFile(path);
});