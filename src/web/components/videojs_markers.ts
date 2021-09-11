import { VideoJsPlayer } from "video.js";

// http://www.sampingchuang.com/videojs-markers
export interface Marker {
  time: string
  text: string
}
export interface MarkersPlugin {
  removeAll();
  destroy();
  add(markers: Marker[]);
  reset(markers: Marker[]);
}
export interface MarkersPluginOptions  {
  markerStyle: {[k: string]: string};
  markers: Marker[];
}
export function withMarkers(player: VideoJsPlayer, cb: (markers: MarkersPlugin)=>void) {
  if (player && (player as any).markers) {
    cb((player as any).markers);
  }
}
