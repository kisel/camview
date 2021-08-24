# requires inotify-tools
CAM=${CAM:-/mnt/video/cam}
CACHE=${CACHE:-/mnt/video/cache}
cd $CAM
MD=/app/motion_detector.py

inotifywait -r -m . -e create --exclude '[.]tmp'|
    while read dir action file; do
        if echo "$file" | grep -E '[.]ts$'; then
            echo "$(date +%T) - New $dir/$file"
            mkdir -p $CACHE/$dir
            $MD -v "$dir/$file" -o $CACHE/$dir/${file%.*}.json
            echo "$(date +%T) - Processed $dir/$file"
        fi
    done
