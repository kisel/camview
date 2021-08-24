
const cache = {}

const defExpire = 300000;
// Local key-value cache

setInterval(cacheVacuum, defExpire);

function cacheVacuum() {
    const now = new Date().getTime();
    for (const k in cache) {
        const {expire} = cache[k] || {}
        if (expire && now > expire) {
            delete cache[k];
        }
    }
}

export function cacheGet(key: string): any {
    return cache[key]?.value;
}

export function cacheSet(key: string, value: any) {
    return cache[key] = {expire: new Date().getTime() + defExpire, value}
}
