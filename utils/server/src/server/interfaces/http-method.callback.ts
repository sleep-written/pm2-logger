import type { Request, Response, NextFunction } from 'express';

export type HTTPMethodCallback = (
    req: Request,
    res: Response,
    nxt: NextFunction
) => unknown;