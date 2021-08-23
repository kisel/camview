FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && \
    apt install -y --no-install-recommends python3-dev python3-pip && \
    rm -rf /var/lib/apt/lists/*

RUN pip install opencv-python-headless
WORKDIR /app
COPY motion_detector.py /app/

