import { CamMetadataDict } from "../../common/models";

function fmtHHMM(label: string, rex: RegExp) {
    const maHHMM = label.match(rex)
    const {hh, mm} = maHHMM?.groups || {};
    if (hh && mm) {
        return `${hh}:${mm}`
    }
}
// post-process some known labels
export function beautify(label: string, camMeta: CamMetadataDict|undefined): string {

    let labelHHMM = (
        // cam-1244-1626973290
        fmtHHMM(label, /^\w+-(?<hh>\d\d)(?<mm>\d\d)-(?<epoch>\d{10})[.].*/) ||
        // cam227-20210909-1501
        fmtHHMM(label, /^[\w-]*-(?<hh>\d\d)(?<mm>\d\d)([.-].*|$)/)
    );
    if (labelHHMM) {
        return labelHHMM;
    }

    const mHH = label.match(/^(\d\d)$/)
    if (mHH) {
        return `${mHH[1]}:--`
    }

    const metaLabel = camMeta[label]?.label;
    if (metaLabel) {
        return metaLabel;
    }
    return label;
}
