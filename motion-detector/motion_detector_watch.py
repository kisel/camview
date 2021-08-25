#!/bin/env python3

import os
import re
import sys
import subprocess
import argparse
import time

import inotify.adapters
from inotify.constants import IN_CREATE
VIDEO_FILES = re.compile(".*[.](ts|mp4)$")

def log(msg):
    print(msg)

def main():
    parser = argparse.ArgumentParser(description='Motion detector')
    parser.add_argument('--detector', default='./motion_detector.py')
    parser.add_argument('--detector-options', help='extra CLI args passed to detector like -E')
    parser.add_argument('-m', '--maskdir', help='directory with camera mask files')
    parser.add_argument('camdir', help="base cam directory with structure cam/dd-mm-hh/hh/*.mp4|ts")
    parser.add_argument('outdir', help="output directory, which repeats camdir structure")
    args=parser.parse_args()
    camdir = args.camdir
    outdir = args.outdir
    maskdir = args.maskdir
    detector = args.detector

    i = inotify.adapters.InotifyTree(camdir, mask=IN_CREATE)

    for event in i.event_gen(yield_nones=False):
        (evt, type_names, path, filename) = event
        if not VIDEO_FILES.match(filename) or evt.mask != IN_CREATE:
            continue
        relpath = os.path.relpath(path, camdir)
        camname = relpath.split('/')[0]
        base_name = os.path.splitext(filename)[0]
        os.makedirs(os.path.join(outdir, relpath), exist_ok=True)
        outfile_base = os.path.join(outdir, relpath, base_name)
        jsonoutfile = outfile_base + '.json'
        log(f"{camname}: {path}/{filename} created")
        cli_args = [detector]
        maskfile = os.path.join(maskdir, camname + '.png')
        if maskfile and os.path.isfile(maskfile):
            cli_args += ['--mask', maskfile]
        cli_args += ['-v']
        cli_args += ['-o', jsonoutfile]
        cli_args += ['--image-out', outfile_base + '.detector.{detectidx}.jpg']
        if args.detector_options:
            cli_args += [args.detector_options]
        cli_args += [os.path.join(path, filename)]
        log(f"{camname}: {' '.join(cli_args)}")
        detector_proc = subprocess.run(cli_args)
        log(f"{camname}: done. rc = {detector_proc.returncode}")

if __name__ == '__main__':
    main()

