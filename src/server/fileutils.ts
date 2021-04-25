import * as fse from 'fs-extra'
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
