import * as React from 'react';
import {render} from 'react-dom';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { CameraList, CameraTimeline } from './components/cameras';
import { observer } from 'mobx-react-lite';
import { theLocation } from './store/location';
import { Container } from 'react-bootstrap';
import { CamPathBreadbrumb } from './components/breadcrumb';

const Content = observer(() => {
    if (theLocation.path == '/') {
        theLocation.change('/view/')
    } else if (theLocation.path == '/view/') {
          return <CameraList/>;
    } else if (/^[/]view[/].*/.test(theLocation.path)) {
          return <CameraTimeline/>;
    } else {
        return <div>Not found</div>
    }
});

export const App = observer(() => (
    <Container>
        <CamPathBreadbrumb/>
        <Content/>
    </Container>
));

render(<App/>, document.getElementById('app'));
