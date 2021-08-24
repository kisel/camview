import { MotionDetectorMetadata } from "./models";

export function firstMotionOffsetSec(detector: MotionDetectorMetadata): number | undefined {
    if (!detector || !detector.fps || !detector.motion_start_frames) {
        return undefined
    }
    return Math.floor(detector.motion_start_frames[0] / detector.fps);
}
