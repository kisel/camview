import * as React from 'react';
import {render} from 'react-dom';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { observer } from 'mobx-react-lite';
import { Container } from 'react-bootstrap';
import { CamPathBreadbrumb } from './components/breadcrumb';
import { AppRouter } from './pages/router';


export const App = observer(() => (
    <Container>
        <CamPathBreadbrumb/>
        <AppRouter/>
    </Container>
));

render(<App/>, document.getElementById('app'));
