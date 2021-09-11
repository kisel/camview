import * as path from 'path'
import { logger } from "../common/logger";
import { current_config } from './config';
import { getDirFilenames, verifySafeFileName } from "./fileutils";

export async function selectVideoSourceByName(parentDir: string, basefn: string, camname: string) {
    let selectedFile = path.join(parentDir, `${basefn}.ts`);

    const maLocalTimeFile = basefn.match(/^[\w-]*-(\d{4})$/);
    if (maLocalTimeFile) {
        const [selectedHHMM] = maLocalTimeFile;
        // default filenames have format camname-hhmm-epoch{10} i.e cam117-0759-1630457992
        // another way to retrieve a file for clients to specify any filenames ending on -HHMM,
        // which is enough to identify a single file(for easier camera switch or file downloads).
        // server is timmezone-agnostic
        const all_filenames = await getDirFilenames(parentDir, /.*[.]ts$/);
        const matching_filenames = all_filenames.filter((filename) => {
            const maFile = filename.match(/\w+-(\d{4})-(\d{10})[.]ts$/);
            return maFile && maFile[0] === selectedHHMM;
        });
        if (matching_filenames.length > 1) {
            logger.warn(`Multiple files matching a ${camname}/${basefn} pattern: ${matching_filenames.join(', ')}`);
        } else {
            if (matching_filenames.length == 1) {
                selectedFile = path.join(parentDir, `${matching_filenames[0]}.ts`);
            }
        }
    }
    return selectedFile;
}

// runction assumes input received from user and has to be checked
// basefn - filename with no file extension
export async function selectVideoSourceByClientInput(camname: string, date: string, hour: string, basename: string) {
    const basefn = verifySafeFileName(basename);
    const parentDir = path.join(current_config.storage,
        verifySafeFileName(camname),
        verifySafeFileName(date),
        verifySafeFileName(hour)
    );
    const selectedFile = await selectVideoSourceByName(parentDir, basefn, camname);
    return selectedFile;
}
