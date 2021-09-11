import _ = require("lodash");
import { camFilenameToMM } from "./cam_filenames";

export enum CamPathLen {
    CamName = 1,
    Date,
    Hour,
    Video,
}


export function buildViewUrl(path: string[]) {
    let resPath = path;
    if (path.length == CamPathLen.Video) {
        const fn = _.last(path);
        if (fn) {
            resPath = [...path.slice(0, -1), camFilenameToMM(fn) || fn];
        }
    }
    return _.join(['/view', ...resPath], '/') + '/';
}
