### Motion detector

OpenCV-based noise-tolerant motion detector for IP cameras

### Goals/Features
- avoid false-detections
- detect only significant movements to mark time intervals(tweaked with options)
  - camera self-adjust ( instant 1-2 frames change )
  - grass, trees, spider webs wind, small flying insects movement

TODO:
  - polygon/mask filter
  - improve performance
    - skip frames
    - fast resize? lower resolution?

### Usage with GUI

    ./motion_detector.py -vW ~/video-datasets/*.mp4      

### Usage from app

    ./motion_detector.py -o - ~/video-datasets/*.mp4      


