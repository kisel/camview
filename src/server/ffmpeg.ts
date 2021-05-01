import child_process = require('child_process')
import { current_config } from './config';

export function ffmpeg(ffmpegArgs: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        // console.log(['ffmpeg', ...ffmpegArgs].join(' '))
        const proc = child_process.spawn('ffmpeg', ffmpegArgs, { stdio: 'ignore' });
        proc.on('close', (code) => {
            if (code != 0) {
                console.log(`ffmpeg exit code: ${code}. command: ffmpeg ${ffmpegArgs.join(' ')}`)
                reject(new Error(`Ffmpeg failed`));
            } else {
                resolve();
            }
        });
    });
}

export function convertToMp4(srcPath: string, dstPath: string) {
    return ffmpeg(['-i', srcPath, '-c:v', 'copy', dstPath]);
}

// generate a single image from video
export function getVideoThumbnail(srcPath: string, dstPath: string) {
    return ffmpeg([
        '-skip_frame', 'nokey',
        '-fflags', '+genpts+discardcorrupt',
        '-i', srcPath,
        '-vcodec', 'mjpeg',
        '-filter:v', `scale=${current_config.thumbnail_width}:-1`,
        '-frames:v', '1',
        dstPath
    ]);
}
