
import _ = require("lodash");
import { action, observable, toJS } from "mobx";

export interface ClientSettings {
    // device needs re-encoded streams
    legacy_mode?: boolean

    // use legacy native browser player(no video.js)
    native_player?: boolean

    // preferred daytime for day-snapshot
    favorite_time?: number

    cam_columns?: number
    with_borders?: boolean
    // show videos without any actions
    show_all_video?: boolean
}

export const defaultSettings: ClientSettings = {
    favorite_time: 15,
    cam_columns: 6,
}


class SettingsStore {
    settings = observable(defaultSettings)

    constructor() {
        this.load()
    }

    @action.bound
    load() {
        if (!localStorage || !localStorage['settings']) {
            return;
        }
        try {
            for (const k in defaultSettings) {
                this.settings[k] = defaultSettings[k]
            }
            const settings = JSON.parse(localStorage['settings'])

            for (const k in settings) {
                this.settings[k] = settings[k]
            }
        } catch (e) {
            console.log(`Failed to read settings: ${e}`)
        }
    }

    @action.bound
    configure(settings: Partial<SettingsStore>) {
        for (const k in settings) {
            this.settings[k] = settings[k]
        }
        if (localStorage) {
            localStorage['settings'] = JSON.stringify(toJS(this.settings))
        }
    }

}

export const theSettingsStore = new SettingsStore();
export const theSettings = theSettingsStore.settings;
