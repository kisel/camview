import * as fs from 'fs'

export interface Config {
    http_port: number;
    storage: string;
    workdir: string;
}

const default_config: Partial<Config> = {
    http_port: parseInt(process.env.PORT) || 8000,
    storage: '/tmp/camview-storage',
    workdir: '/tmp/camview-workdir',
}

function loadConfig(): Config {
    const file_cfg: Config = JSON.parse(fs.readFileSync("config.json", { encoding: 'utf8' }));
    const cfg = {...default_config, ...file_cfg}
    return cfg;
}

export const current_config: Config = loadConfig();


