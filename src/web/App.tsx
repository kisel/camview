import * as React from 'react';
import {render} from 'react-dom';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import { observer } from 'mobx-react-lite';
import { CamPathBreadbrumb } from './components/breadcrumb';
import { AppRouter } from './pages/router';
import { theSettings } from './store/settings';


export const App = observer(() => (
    <div className={theSettings.with_borders ? "container" : "container-fluid"}>
        <CamPathBreadbrumb/>
        <AppRouter/>
    </div>
));

render(<App/>, document.getElementById('app'));
