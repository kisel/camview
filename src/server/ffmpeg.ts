import child_process = require('child_process')
import fs = require('fs')
const MultiStream = require('multistream')
import { current_config } from './config';

// required for seek in produced mp4 files
const ffmpeg_movflags = ['-movflags', 'faststart']

export interface FfmpegJob {
    done: Promise<void>;
    stop: () => void;
}

function blackhole() {
    const { debug } = current_config;
    return (debug > 0) ? 'inherit' : 'ignore';
}

export function ffmpeg(ffmpegArgs: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const {debug} = current_config;
        if (debug) {
            console.log(['ffmpeg', ...ffmpegArgs].join(' '))
        }
        const stdio = (debug > 0) ? 'inherit' : 'ignore';
        const proc = child_process.spawn('ffmpeg', ffmpegArgs, { stdio });
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

// change container format only (TS -> MP4)
export function convertToMp4(srcPath: string, dstPath: string) {
    return ffmpeg(['-i', srcPath, '-c:v', 'copy', ...ffmpeg_movflags, dstPath]);
}

// change container format only (TS -> MP4)
export function convertFilesToMp4(srcFiles: string[], dstPath: string): FfmpegJob {
    const ctx = {
        ffmpeg: null as child_process.ChildProcess
    }
    const stop = () => {
        if (ctx.ffmpeg != null) {
            console.log(`Interrupting ffmpeg process: pid=${ctx.ffmpeg.pid} dst=${dstPath}`)
            ctx.ffmpeg.kill();
        }
    }

    const done = new Promise<void>((resolve, reject) => {
        const ffmpegArgs = ['-i', '-', '-c:v', 'copy', ...ffmpeg_movflags, dstPath];

        const lazyStreams = srcFiles.map((fn) => () => fs.createReadStream(fn))
        ctx.ffmpeg = child_process.spawn('ffmpeg', ffmpegArgs, {stdio: ['pipe', blackhole(), blackhole()]});
        (new MultiStream(lazyStreams)).pipe(ctx.ffmpeg.stdin)

        ctx.ffmpeg.on('close', (code) => {
            ctx.ffmpeg = null;
            if (code != 0) {
                console.log(`ffmpeg exit code: ${code}. command: ffmpeg ${ffmpegArgs.join(' ')}`)
                reject(new Error(`Ffmpeg failed`));
            } else {
                resolve();
            }
        });
    });

    return {done, stop};
}

// reencode as a single file for dumb devices
export function reencodeToMp4H264(srcPath: string, dstPath: string) {
    return ffmpeg([
        '-i', srcPath,
        ...'-vcodec libx264 -acodec aac -profile:v main -preset ultrafast -s hd720'.split(/ +/),
        ...ffmpeg_movflags,
        dstPath
    ]);
}

// generate a single image from video
export function getVideoThumbnail(srcPath: string, dstPath: string, resolution: string) {
    let vfilter: string[] = []
    if (resolution == 'thumbnail') {
        vfilter = ['-filter:v', `scale=${current_config.thumbnail_width}:-1`]
    } if ([null, undefined, 'original'].includes(resolution)) {
        vfilter = []
    }

    return ffmpeg([
        '-skip_frame', 'nokey',
        '-fflags', '+genpts+discardcorrupt',
        '-i', srcPath,
        '-vcodec', 'mjpeg',
        ...vfilter,
        '-frames:v', '1',
        dstPath
    ]);
}
