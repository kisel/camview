import * as fse from 'fs-extra'
import * as path from 'path';
import { current_config } from './config';

// Check if detector thumbnail exists
export async function getDetectorThumbnailFile(campath: string[], basefn: string, detectorIdx: string) {
    const {cachedir} = current_config
    if (detectorIdx && !detectorIdx.match(/^\d+$/)) {
        return undefined;
    }
    // there can be multiple .N.jpeg files
    const jpgPath = path.join(cachedir, ...campath, `${basefn}.detector.${detectorIdx || '1'}.jpg`);
    console.log(jpgPath)

    if (await fse.pathExists(jpgPath)) {
        return jpgPath
    } else {
        return undefined;
    }
}
