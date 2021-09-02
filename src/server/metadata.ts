import * as fse from 'fs-extra'
import _ = require('lodash');
import * as path from 'path';
import { CamFileMetadata, MotionDetectorRawJsonFile } from '../common/models';
import { cacheGet, cacheSet } from './cache';
import { current_config } from './config';
import { isSafeFileName } from './fileutils';


async function readMetadataFile(filename: string): Promise<CamFileMetadata> {
    return fse.readJSON(filename)
        .then((v: MotionDetectorRawJsonFile) => ({detector: v.detector_results[0]}))
        .catch(() => null);
}

export async function readVideoMetadataFile(camname:string, date: string, hour: string, basename): Promise<CamFileMetadata> {
    const {cachedir} = current_config;
    const metafn = path.join(cachedir, camname, date, hour, `${basename}.json`);
    return readMetadataFile(metafn)
}

export async function readMetadataForFiles(relPath: string[], filenames: string[]): Promise<CamFileMetadata[]> {
    const {cachedir} = current_config;
    if (!cachedir || !_.every(relPath, isSafeFileName)) {
        return null;
    }
    return Promise.all(filenames.map(async (fn) => {
        const metafn = path.join(cachedir, ...relPath, fn.replace(/[.](ts|mp4)$/, '.json'))
        const cres = cacheGet(metafn)
        if (cres != undefined) {
            return cres;
        }
        const res = await readMetadataFile(metafn);
        if (res !== null) {
            cacheSet(metafn, res)
        }
        return res;
    }));
}
