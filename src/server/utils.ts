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
                if (!res.writableEnded) {
                    const status = handlerErr && Number.isInteger(handlerErr['status']) ? handlerErr['status'] : 403;
                    console.error('Unhandled error:', status, handlerErr);
                    res.status(status).json({error: errorToStr(handlerErr)});
                }
            });
    };
}

export class CtxGuard {
    ctxFunc: () => any;
    ctx: string;
    constructor(ctxFunc: () => any) {
        this.ctxFunc = ctxFunc;
        this.ctx = JSON.stringify(this.ctxFunc())
    }
    // true only if the context determined by ctxFunc is the same as was when the object was constructed
    unchanged() {
        return this.ctx === JSON.stringify(this.ctxFunc())
    }
}

export function sendFileHelper(req: express.Request, response: express.Response, fileName: string) {
    return new Promise<void>((resolve, reject) => {
        response.sendFile(fileName, { acceptRanges: false }, (err) => {
            if (err != null) {
                console.log(`Unexpected error while sending file to ${req.url}`)
                response.end();
                resolve();
            }
            reject();
        })
    })
}
