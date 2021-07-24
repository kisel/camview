import { observer } from 'mobx-react-lite';
import React = require('react');
import { SettingsPage } from '../pages/settings';

import "./settings.css"

export const SettingsMenu = observer(() => {
    return (
        <div className="settings-menu">
            <SettingsPage />
        </div>
    );
});
