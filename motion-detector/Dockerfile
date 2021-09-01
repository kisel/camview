FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && \
    apt install -y --no-install-recommends python3-dev python3-pip && \
    apt install -y --no-install-recommends python3-dev python3-pip inotify-tools vim-tiny && \
    rm -rf /var/lib/apt/lists/*

RUN pip install opencv-python-headless
RUN pip install inotify
WORKDIR /app
ENV PYTHONUNBUFFERED=1

COPY *.py /app/

