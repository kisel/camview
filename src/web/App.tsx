import * as React from 'react';
import {render} from 'react-dom';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { CameraList, CameraTimeline } from './components/cameras';
import { observer } from 'mobx-react-lite';
import { theLocation } from './location';

export const App = observer(() => {
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

render(<App/>, document.getElementById('app'));
