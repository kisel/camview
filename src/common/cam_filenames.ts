/*
examples:

cam filename: cam117-0759-1630457992

options for local filenames:
local filename: cam117-20210901-0759

see also selectVideoSourceByName
*/
function pad2(v: number) {
    return v < 10 ? `0${v}` : `${v}`;
}

// return local timezone YYYYMMDD with no spaces from Date
function getYYYYMMDD(d: Date) {
    return [d.getFullYear(), d.getMonth()+1, d.getDate()].map(pad2).join('');
}

export function camToLocalFilename(filename: string) {
    const ma = filename.match(/^(?<prefix>\w+)-(?<hhmm>\d{4})-(?<epoch>\d{10})[.](?<ext>\w+)$/);
    if (ma?.groups?.epoch) {
        const {prefix, hhmm, epoch, ext} = ma.groups;
        const fnDate = new Date((+epoch) * 1000);
        return `${prefix}-${getYYYYMMDD(fnDate)}-${hhmm}.${ext}`;
    }
    return filename;
}

export function camFilenameMatchingHHMM(filename: string, hhmm: string): boolean {
    const ma = filename.match(/^(?<prefix>\w+)-(?<hhmm>\d{4})-(?<epoch>\d{10})[.](?<ext>\w+)$/);
    return (ma?.groups?.hhmm) === hhmm;
}
