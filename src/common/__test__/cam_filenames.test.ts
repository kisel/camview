import { camToLocalFilename } from "../cam_filenames"

it("should convert cam filename to user-friencly names", () => {
    expect(camToLocalFilename('cam117-0759-1630457992.mp4')).toEqual('cam117-20210901-0759.mp4');
})

it("should keep unknown filename format", () => {
    const customFN = 'some-custom-file-name-format.mp4';
    expect(camToLocalFilename(customFN)).toEqual(customFN);
})
