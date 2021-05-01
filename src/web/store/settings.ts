
import _ = require("lodash");
import { action, observable } from "mobx";

class SettingsStore {
    @observable profile: string | undefined = undefined;
    @observable legacyMode = false;

    // enable support for old devices
    constructor() {
        if (localStorage) {
            this.legacyMode = !!localStorage['legacy'];
        }
    }

    @action.bound
    setLegacyMode(val: boolean) {
        if (localStorage) {
            localStorage['legacy'] = val;
        }
        this.legacyMode = val;
    }

}

export const theSettingsStore = new SettingsStore();
