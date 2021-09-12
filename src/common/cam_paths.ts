import _ = require("lodash");
import { camFilenameToMM } from "./cam_filenames";

export enum CamPathLen {
    CamName = 1,
    Date,
    Hour,
    Video,
}

// converts camPath to pretty camPath
export function prettyPath(path: string[]) {
    let resPath = path;
    if (path.length == CamPathLen.Video) {
        const fn = _.last(path);
        if (fn) {
            resPath = [...path.slice(0, -1), camFilenameToMM(fn) || fn];
        }
    }
    return resPath;
}

export function viewUrlFromPrettyPath(ppath: string[]) {
    return _.join(['/view', ...ppath], '/') + '/';
}

export function buildViewUrl(path: string[]) {
    return viewUrlFromPrettyPath(prettyPath(path));
}
