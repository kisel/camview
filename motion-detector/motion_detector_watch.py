#!/bin/env python3

import os
import glob
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

def process_file(args, path, filename):
    camdir = args.camdir
    outdir = args.outdir
    maskdir = args.maskdir
    detector = args.detector
    fileFilter = re.compile(args.filter)

    if not VIDEO_FILES.match(filename):
        return

    relpath = os.path.relpath(path, camdir)
    if not fileFilter.search(f"{relpath}/{filename}"):
        log('skipping {relpath}/{filename} as it doesnt match {args.filter}')
        return

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
    if args.options:
        cli_args += args.options.split(' ')
    cli_args += [os.path.join(path, filename)]
    log(f"{camname}: {' '.join(cli_args)}")
    detector_proc = subprocess.run(cli_args)
    log(f"{camname}: done. rc = {detector_proc.returncode}")

def main():
    parser = argparse.ArgumentParser(description='Motion detector inotify watcher')
    parser.add_argument('--detector', default='./motion_detector.py')
    parser.add_argument('--options', help='extra CLI args passed to detector like -E. separate multiple options with spaces')
    parser.add_argument('--watch', '-w', action='store_true', help="inotify watch on camdir")
    parser.add_argument('--redetect', nargs='*',
            help="find all files in camdir and run processing. accepts glob")
    parser.add_argument('-f', '--filter', default=".*", help='filter by paths/filenames')
    parser.add_argument('-m', '--maskdir', help='directory with camera mask files')
    parser.add_argument('camdir', help="base cam directory with structure cam/dd-mm-hh/hh/*.mp4|ts")
    parser.add_argument('outdir', help="output directory, which repeats camdir structure")
    args=parser.parse_args()

    if args.redetect:
        for glob_pattern in args.redetect:
            for filename in glob.iglob(glob_pattern, recursive=True):
                process_file(args, os.path.dirname(filename), os.path.basename(filename))

    if args.watch:
        i = inotify.adapters.InotifyTree(args.camdir, mask=IN_CREATE)
        for event in i.event_gen(yield_nones=False):
            (evt, type_names, path, filename) = event
            if evt.mask != IN_CREATE: # likely not needed, but just in case
                continue
            process_file(args, path, filename)

if __name__ == '__main__':
    main()

