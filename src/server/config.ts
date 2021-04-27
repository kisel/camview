import * as fs from 'fs'
import { CameraDef } from '../common/models';

const config_file_path = process.env.CONFIG_FILE || "config.json"

export interface Config {
    http_port: number;
    storage: string;  // path to video data storage
    cachedir: string; // cache / temp directory
    cameras?: CameraDef[] | null;
}

const default_config: Config = {
    http_port: parseInt(process.env.PORT) || 8000,
    storage: process.env.STORAGE  || '/tmp/camview-storage',
    cachedir: process.env.CACHEDIR || '/tmp/camview-cache',
    cameras: null,
}

function loadConfig(): Config {
    let file_cfg: Partial<Config> = {}
    try {
        file_cfg = JSON.parse(fs.readFileSync(config_file_path, { encoding: 'utf8' }));
    } catch(e) {
        console.log(`Can't load config file ${config_file_path}: ${e}`)
    }
    const cfg = {...default_config, ...file_cfg}
    return cfg;
}

export const current_config: Config = loadConfig();


