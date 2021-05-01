import express = require("express");
import tmp = require("tmp");
import path = require("path");
import { apiError } from "./utils";

// should create a file inside tmppath and return full path to it
type FileGenerator = (tmppath: string) => Promise<string>;

export function apiFileGenWrapper(req: express.Request, res: express.Response, gen: FileGenerator): Promise<void> {
    return new Promise<void>((wrapperResolve) => {
        tmp.dir({ template: 'camview-XXXXXX', unsafeCleanup: true }, async (err, tmppath, cleanupCallback) => {
            if (err) {
                apiError(res, err);
            } else {
                try {
                    const tmpFile = await gen(tmppath);
                    await new Promise<void>((resolve, _reject) => {
                        res.sendFile(tmpFile, (err) => {
                            if (err != null) {
                                console.log(`Unexpected error while sending file ${tmpFile}`)
                                res.end();
                            }
                            resolve();
                        });
                    });
                } catch (e) {
                    apiError(res, e);
                }
                cleanupCallback();
                wrapperResolve();
            }
        });
    });
}



