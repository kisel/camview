#!/bin/env python

import cv2
import json
import time
import os
import sys
import argparse
import numpy as np

GREEN = (0, 255, 0)
log = lambda msg: None

def process_input(streamSrc, args):
    ref_frame = None
    video = cv2.VideoCapture(streamSrc)

    frameIdx = 0
    height, width = 0, 0
    minArea = 0
    move_seq_len = 0
    base_resolution = [800, 600]
    motion_frames = 0
    too_many_objects = 0
    process_frames = 1
    fps = 0
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
            move_seq_len += 1
        else:
            move_seq_len = 0

        if move_seq_len > args.min_seq:
            motion_frames += 1

        if args.gui:
            if move_seq_len >= args.min_seq:
                for contour in moved_objects:
                    (x, y, w, h) = cv2.boundingRect(contour)
                    cv2.rectangle(frame, (x, y), (x + w, y + h), GREEN, 2)
            if not args.one_window:
                cv2.imshow("Color Frame", frame)
                cv2.imshow("Gray Frame", gray)
                cv2.imshow("Delta Frame", delta_frame)
                cv2.imshow("Threshold Frame", thres_frame)
            else:
                h, w = frame.shape[:2]
                sidebar = g2c(np.vstack((gray, delta_frame, thres_frame)))
                if mask is not None:
                    # draw mask on red layer where gray image is placed
                    sidebar[0:h, 0:w, 2][mask == 0] = 155
                quad = np.hstack((
                    frame,
                    cv2.resize(sidebar, [int(w/3), h])
                    ))
                cv2.imshow("Quad", quad)
            key = cv2.waitKey(int(1000.0 / args.fps))
    video.release()
    if args.gui:
        cv2.destroyAllWindows()
    return {
            'stream': streamSrc,
            'motion_frames_total': motion_frames,
            'too_many_objects': too_many_objects
            }

def g2c(g):
    return cv2.cvtColor(g, cv2.COLOR_GRAY2BGR)

def main():
    parser = argparse.ArgumentParser(description='Motion detector')
    parser.add_argument('--gui', action='store_true')
    parser.add_argument('-v', '--verbose', action='store_true')
    parser.add_argument('-W', '--one-window', action='store_true')
    parser.add_argument('--fps', default=60, type=int, help='draw fps')
    # it always makes sense to limit fps input to reasonable 5 / 10fps
    parser.add_argument('--dps', default=10, type=int, help='max detector ticks per second')
    parser.add_argument('-m', '--mask',
            help='binary mask file' )
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
    parser.add_argument('--min-seq', type=int, default=2,
            help='minimal sequence of changed frames to capture movement' )
    parser.add_argument('input', nargs='+', help="file/rtsp stream")
    args=parser.parse_args()

    if type(args.threads) is int:
        cv2.setNumThreads(args.threads)
    if args.one_window:
       args.gui = True
    if args.gui or args.verbose:
        global log
        log = lambda msg: print(msg)
    detector_results = []
    for streamSrc in args.input:
        t1 = time.time()
        res = process_input(streamSrc, args)
        t2 = time.time()
        res['process_time'] = t2 - t1
        detector_results.append(res)
        log(json.dumps(res, indent=2))
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

if __name__ == '__main__':
    main()

