import * as React from 'react';
import {render} from 'react-dom';
import {observer} from 'mobx-react-lite';
import {autorun} from 'mobx';

import './App.css';
import { CamList } from './pages/CamList';


const Router = observer(() => {
    return <CamList />;
});

const App = observer(() => {
    return (
        <Router/>
    );
});

render(<App/>, document.getElementById('app'));
