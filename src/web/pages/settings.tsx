import React = require("react");
import { observer } from "mobx-react-lite";
import { ClientSettings, defaultSettings, theSettings, theSettingsStore } from "../store/settings";

interface SettingProps {
    label: string;
    name: keyof ClientSettings;
}

const BoolSetting = observer(({name, label}: SettingProps) => {
    const val = !!theSettingsStore.settings[name]
    const hid = `setting-${name}`

    return (
        <div className="form-check">
            <input className="form-check-input" id={hid} type="checkbox" checked={val} onChange={
                () => { theSettingsStore.configure({ [name]: !val }) }
            } />
            <label className="form-check-label" htmlFor={hid}>
                {label}
            </label>
        </div>
    );
});

interface NumSettingProps extends SettingProps {
    min: number
    max: number
    step: number
}

const NumSetting = observer(({name, label, min, max, step}: NumSettingProps) => {
    const val = theSettingsStore.settings[name] || defaultSettings[name]
    const hid = `setting-${name}`

    return (
        <>
            <label htmlFor={hid} className="form-label">{name}</label>
            <input type="range" className="form-range" id={hid}
                value={`${val}`}
                onChange={
                    (e) => { theSettingsStore.configure({ [name]: e.target.value }) }
                }
                {...{ min, max, step }}
            />
        </>
    );
});

interface DropdownSettingProps extends SettingProps {
    choices: any[]
}
const DropdownSetting = observer(({name, label, choices}: DropdownSettingProps) => {
    const val = theSettingsStore.settings[name] || defaultSettings[name]
    const hid = `setting-${name}`

    return (
        <>
            <label htmlFor={hid} className="form-label">{name}</label>
            <select className="form-select form-select-sm"  onChange={(e)=> theSettingsStore.configure({[name]: e.target.value})} value={`${val}`}>
                {choices.map((c)=>(
                    <option key={c}>{c}</option>
                ))}
            </select>
        </>
    );
});

export const SettingsPage = observer(() => {
    return (
        <form>
            <BoolSetting label="Enable legacy device support" name="legacy_mode"/>
            <BoolSetting label="Borders" name="with_borders"/>
            <BoolSetting label="Native player" name="native_player"/>
            <DropdownSetting label="Cam columns" name="cam_columns" choices={[2, 3, 4, 6, 12]}/>
            <DropdownSetting label="Favorite time" name="favorite_time" choices={[0, 12, 15, 18, 22]}/>
        </form>
    );
});
