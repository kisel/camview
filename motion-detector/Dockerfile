FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && \
    apt install -y --no-install-recommends python3-dev python3-pip && \
    apt install -y --no-install-recommends python3-dev python3-pip inotify-tools vim-tiny && \
    rm -rf /var/lib/apt/lists/*

RUN pip install opencv-python-headless
WORKDIR /app

COPY motion_detector.py /app/
COPY watch_and_process.sh /app/

