import * as fse from 'fs-extra'
import _ = require('lodash');
import * as path from 'path';

export const RE_SAFE_FILENAME = /^[-a-zA-Z0-9_]+$/

export function isSafeFileName(name: string) {
    return RE_SAFE_FILENAME.test(name);
}

// throws an exception if the name is not safe
export function verifySafeFileName(name: string): string {
    if (!isSafeFileName(name)) {
        throw Error(`filename ${name} is not allowed`)
    }
    return name;
}

type NameStatFilter = (fullpath: string, fstat: fse.Stats) => boolean;

async function readDirNames(dir: string, filter: NameStatFilter): Promise<string[]> {
    const filenames = await fse.readdir(dir);
    let names: string[] = [];
    for (const fn of filenames) {
        const fullpath = path.join(dir, fn);
        try {
            const fstat = await fse.stat(fullpath);
            if (filter(fullpath, fstat)) {
                names.push(fn);
            }
        } catch(e) {
            console.log(`stat failed for ${fullpath}: ${e}`)
        }
    }
    return names;
}

export async function getSubdirNames(dir: string): Promise<string[]> {
    return readDirNames(dir, (_fullpath, fstat) => fstat.isDirectory());
}

export async function getDirFilenames(dir: string, file_regexp: RegExp): Promise<string[]> {
    return readDirNames(dir, (fullpath, fstat) => file_regexp.test(fullpath) && fstat.isFile());
}

export interface FileInfo {
    name: string;
    parentPath: string;
    fullpath: string;
    fstat: fse.Stats;
}

async function readDirStat(dir: string): Promise<FileInfo[]> {
    const filenames = await fse.readdir(dir);
    const parentPath = dir;
    return Promise.all(filenames.map(name => {
        const fullpath = path.join(dir, name);
        return fse.stat(fullpath).catch(() => null).then( fstat => ({
            name, fullpath, fstat, parentPath,
        }));
    })).then(res => res.filter(fi => fi.fstat != null));
}

function sortNewestFirst(a: FileInfo, b: FileInfo): number {
    return b.fstat.mtimeMs - a.fstat.mtimeMs;
}

type FileInfoFilter = (fi: FileInfo) => boolean;
// find latest file at exact depth
export async function findNewestFileDeep(dir: string, depth: number, fileFilter: FileInfoFilter, defaults?: string[]): Promise<FileInfo> {
    if (depth < 0) {
        return null;
    }
    let items = await readDirStat(dir);
    items.sort(sortNewestFirst);
    if (defaults && defaults[depth]) {
        items.push(defaults['depth'])
    }
    for (const fi of items) {
        if (depth == 0 && fi.fstat.isFile() && fileFilter(fi)) {
            return fi;
        }
        if (depth > 0 && fi.fstat.isDirectory()) {
            const res = await findNewestFileDeep(path.join(dir, fi.name), depth - 1, fileFilter);
            if (res != null) {
                return res;
            }
        }
    }
    return null;
}
