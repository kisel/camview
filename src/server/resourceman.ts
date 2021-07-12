import { current_config } from "./config";
import tmp = require("tmp");

class CacheEntry {
    filePath: string;
    createdAt: Date
    keepUntil: Date
    cacheTime: number; // in seconds
    valid: boolean;
    size: number;
    pending: Promise<void>;
}

interface PopulateCacheInput {
    newItem: CacheEntry
}
interface PopulateCacheResult {
    cacheTime: number; // undefined or 0 - return, but do not store
}


type PopulateCacheFunc = (newItem: PopulateCacheInput) => Promise<PopulateCacheResult>;

class ResourceManager {

    private items: { [id: string]: CacheEntry }

    // id - unique ID for resource
    // returns once CAc
    retrieveOrCreate(id: string, createFunc: PopulateCacheFunc): Promise<CacheEntry> {
        let entry: CacheEntry = this.items[id];
        if (entry == undefined) {
            entry = this.items[id] = new CacheEntry();
            createFunc({newItem: entry})
            //tmp.dir()
        }
        entry.keepUntil = new Date(new Date().getTime() + (current_config.cache_time || 60) * 1000);
        return entry.pending.then(() => entry); // return resource once it is ready
    }

    cleanup() {
        console.log("cleaning cache...")
    }

}


export const theResourceMan = new ResourceManager();
