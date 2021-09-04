// post-process some known labels
export function beautify(label: string) {

    //cam-1244-1626973290.mp4
    const mFN = label.match(/^\w+-(\d\d)(\d\d)-\d{10}[.].*/)
    if (mFN) {
        return `${mFN[1]}:${mFN[2]}`
    }

    const mHH = label.match(/^(\d\d)$/)
    if (mHH) {
        return `${mHH[1]}:--`
    }
    return label;
}
