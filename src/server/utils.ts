import * as express from 'express';

import {errorToStr} from '../common/utils';

export function apiError(res: express.Response, err: Error) {
    res.status(403).json({ error: errorToStr(err) });
}

// JSON-API handler
export function apiWrapper<T>(handler: (req: express.Request) => Promise<T>) {
    return (req: express.Request, res: express.Response) => {
        Promise.resolve(handler(req))
            .then(handlerRes => res.json(handlerRes))
            .catch(handlerErr => {
                const status = Number.isInteger(handlerErr['status']) ? handlerErr['status'] : 403;
                console.error('Unhandled error:', status, handlerErr);
                res.status(status).json({error: errorToStr(handlerErr)});
            });
    };
}

export function errorWrapper(handler: (req: express.Request, response: express.Response) => Promise<void>) {
    return (req: express.Request, res: express.Response) => {
        Promise.resolve(handler(req, res))
            .then(() => {
                if (!res.writableEnded) {
                    console.log("ERROR: leaked response");
                    res.end();
                }
            })
            .catch(handlerErr => {
                const status = Number.isInteger(handlerErr['status']) ? handlerErr['status'] : 403;
                console.error('Unhandled error:', status, handlerErr);
                res.status(status).json({error: errorToStr(handlerErr)});
            });
    };
}
