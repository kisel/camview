#!/bin/env python3

import cv2
import json
import time
import os
import sys
import argparse
import numpy as np

GREEN = (0, 255, 0)
log = lambda msg: None

# fixed resolution for simplicity, and we need resize & some blur anyway
base_resolution = [800, 450]

def process_input(streamSrc, args, video_writer=None):
    ref_frame = None
    video = cv2.VideoCapture(streamSrc)

    frameIdx = 0
    height, width = 0, 0
    minArea = 0
    move_seq_len = 0
    longest_move_seq = 0
    total_motion_frames = 0
    too_many_objects = 0
    process_frames = 1
    motion_start_frames = []
    motion_stop_frames = []
    if args.mask:
        mask = cv2.imread(args.mask, cv2.IMREAD_GRAYSCALE)
        mask = cv2.resize(mask, base_resolution)
    else:
        mask = None

    while True:
        check, frame = video.read()
        if not check:
            log("No frames to read")
            break
        frameIdx += 1
        if frameIdx % process_frames != 0:
            continue
        frame = cv2.resize(frame, base_resolution)
        if frameIdx == 1:
            height, width = frame.shape[:2]
            minArea = width * height / args.factor
            fps = video.get(cv2.CAP_PROP_FPS) or args.fps
            if fps > args.dps:
                process_frames = int(fps / args.dps)
            log(f"resolution: {width}x{height}")
            log(f"minArea: {minArea}")
            log(f"input fps: {fps}")
            log(f"detector on each {process_frames} frames")

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        if mask is not None:
            gray = cv2.bitwise_and(gray, mask) # black=ignore white=process
        #gray = cv2.GaussianBlur(gray, (21, 21), 0)

        if ref_frame is None:
            ref_frame = gray
            continue

        delta_frame = cv2.absdiff(ref_frame,gray)

        if frameIdx % args.ref_frames == 0:
            ref_frame = gray
        thres_frame = cv2.threshold(delta_frame, 80, 255, cv2.THRESH_BINARY)[1]
        thres_frame = cv2.dilate(thres_frame, None, iterations=2)

        cnts, _ = cv2.findContours(thres_frame, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        moved_objects = [c for c in cnts if cv2.contourArea(c) > minArea]
        if len(moved_objects) > args.max_groups:
            too_many_objects += 1
            move_seq_len = 0
        elif len(moved_objects) > 0:
            # just started 'event recording'
            move_seq_len += 1
            if move_seq_len == args.min_seq:
                motion_start_frames.append(frameIdx)
        else:
            # continued event recording
            if move_seq_len > args.min_seq:
                motion_stop_frames.append(frameIdx)
            move_seq_len = 0

        if move_seq_len > args.min_seq:
            total_motion_frames += 1
            longest_move_seq = max(longest_move_seq, move_seq_len)

        # write screenshot on the 1st detected and highlighted movement(min_seq)
        write_screenshot = args.image_out and move_seq_len == args.min_seq and len(motion_start_frames) <= args.max_detections
        if args.gui or video_writer or write_screenshot:
            if move_seq_len >= args.min_seq:
                for contour in moved_objects:
                    (x, y, w, h) = cv2.boundingRect(contour)
                    cv2.rectangle(frame, (x, y), (x + w, y + h), GREEN, 2)
            if args.extra:
                h, w = frame.shape[:2]
                sidebar = g2c(np.vstack((gray, delta_frame, thres_frame)))
                if mask is not None:
                    # draw mask on red layer where gray image is placed
                    sidebar[0:h, 0:w, 2][mask == 0] = 155
                quad = np.hstack((
                    frame,
                    cv2.resize(sidebar, [int(w/3), h])
                    ))
                oframe = quad
            else:
                oframe = frame
            if write_screenshot and args.image_out:
                img_fn = args.image_out.format(detectidx=len(motion_start_frames))
                log(f"output screenshot {img_fn}")
                cv2.imwrite(img_fn, oframe)
            if video_writer is not None:
                if not args.video_out_detect_only or move_seq_len > 0:
                    video_writer.write(oframe)
            if args.gui:
                cv2.imshow("Output", oframe)
                key = cv2.waitKey(int(1000.0 / args.fps))
    video.release()
    if args.gui:
        cv2.destroyAllWindows()
    return {
            'stream': streamSrc,
            'fps': fps,
            'total_frames': frameIdx,
            'duration': frameIdx / fps,
            'motion_seconds_longest': longest_move_seq / fps,
            'motion_seconds_total': total_motion_frames / fps,
            'motion_start_frames': motion_start_frames,
            'motion_stop_frames': motion_stop_frames,
            'too_many_objects': too_many_objects
            }

def g2c(g):
    return cv2.cvtColor(g, cv2.COLOR_GRAY2BGR)

def main():
    parser = argparse.ArgumentParser(description='Motion detector')
    parser.add_argument('-W', '--gui', action='store_true')
    parser.add_argument('-v', '--verbose', action='store_true')
    parser.add_argument('-E', '--extra', action='store_true',
            help='draw debugging info')
    parser.add_argument('--fps', default=30, type=int,
            help='stream fps')
    # it always makes sense to limit fps input to reasonable 5 / 10fps
    parser.add_argument('--dps', default=5, type=int,
            help='max detector ticks per second')
    # TODO: merge detections
    parser.add_argument('--max-detections', default=3, type=int,
            help='limit number of detections to output as images')
    parser.add_argument('-m', '--mask',
            help='binary mask file' )
    parser.add_argument('--image-out',
            help='output image for each detection(first frame only). can contain {detectidx}')
    parser.add_argument('-O', '--video-out',
            help='output video with VideoWriter')
    parser.add_argument('-M', '--video-out-detect-only',
            help='output only frames with movement')
    parser.add_argument('--video-out-codec', default='MJPG',
            help='output video with VideoWriter(default MJPG/avi)')
    parser.add_argument('-o', '--output',
            help='output stats json filename' )
    parser.add_argument('-r', '--ref-frames', type=int, default=1,
            help='update reference frame each "r" frames' )
    parser.add_argument('-f', '--factor', type=int, default=1000,
            help='area/factor - minimal area treated as change' )
    parser.add_argument('--max-groups', type=int, default=10,
            help='ignore false detections of too many objects due cam reinit' )
    parser.add_argument('--threads', type=int,
            help='cv2.setNumThreads. 0 - no threads')
    parser.add_argument('--min-seq', type=int, default=3,
            help='minimal sequence of changed frames to capture movement' )
    parser.add_argument('input', nargs='+', help="file/rtsp stream")
    args=parser.parse_args()

    if type(args.threads) is int:
        cv2.setNumThreads(args.threads)
    if args.gui or args.verbose:
        global log
        log = lambda msg: print(msg)
    detector_results = []
    video_writer = None
    if args.video_out:
        fourcc = cv2.VideoWriter_fourcc(*args.video_out_codec)
        w, h = base_resolution
        if args.extra:
            # space for sidebar
            w = w + int(w/3)
        log(f"output video file to {args.video_out}")
        video_writer = cv2.VideoWriter(args.video_out, fourcc, args.dps, [w, h])

    for streamSrc in args.input:
        t1 = time.time()
        res = process_input(streamSrc, args, video_writer=video_writer)
        t2 = time.time()
        res['process_time'] = t2 - t1
        detector_results.append(res)
        log(json.dumps(res, indent=2))
    if video_writer is not None:
        writer.release()
    if args.output:
        out = json.dumps({
            'detector_results': detector_results,
            'cli_args': sys.argv,
            'options': vars(args),
            }, indent=2)
        if args.output == '-':
            print(out)
        else:
            with open(args.output, 'w') as f:
                f.write(out)
            log(f"output json result to {args.output}")

if __name__ == '__main__':
    main()

