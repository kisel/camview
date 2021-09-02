import * as React from 'react';
import {render} from 'react-dom';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import { observer } from 'mobx-react-lite';
import { AppRouter } from './pages/router';
import { theSettings } from './store/settings';
import { BrowserRouter as Router } from 'react-router-dom';
// import * as ScrollMemory from 'react-router-scroll-memory';

export const App = observer(() => (
    <Router>
        {/* <ScrollMemory /> */}
        <AppRouter/>
    </Router>
));

render(<App/>, document.getElementById('app'));
