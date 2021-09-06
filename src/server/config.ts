import * as fs from 'fs'
import * as YAML from 'yaml'
import { CamDef, CamMetadata } from '../common/models';

const config_file_path = process.env.CONFIG_FILE || "config.yaml"

export interface Config {
    http_port: number;
    storage: string;  // path to video data storage
    cachedir: string; // cache / temp directory
    cameras?: CamDef[] | null;
    camera_metadata?: {[k: string]: CamMetadata}
    cache_time: number; // time in sec to cache http responses
    thumbnail_width: number; // width of thumbnails in px
    debug: number; // debug log level
    streams?: string // path to realtime HLS streams /dev/shm/streams/ with layout $camname/s.m3u8
}

const default_config: Config = {
    http_port: parseInt(process.env.PORT) || 8000,
    streams: process.env.RT_STREAM,
    storage: process.env.STORAGE  || '/tmp/camview-storage',
    cachedir: process.env.CACHEDIR || '/tmp/camview-cache',
    cameras: null,
    camera_metadata: {},
    thumbnail_width: 800,
    cache_time: 300,
    debug: 0,
}

function loadConfig(): Config {
    let file_cfg: Partial<Config> = {}
    try {
        file_cfg = YAML.parse(fs.readFileSync(config_file_path, { encoding: 'utf8' }));
    } catch(e) {
        console.log(`Can't load config file ${config_file_path}: ${e}`)
    }
    const cfg = {...default_config, ...file_cfg}
    return cfg;
}

export const current_config: Config = loadConfig();


