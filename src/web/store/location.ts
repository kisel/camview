import {observable, action, computed} from 'mobx';
import {createBrowserHistory} from 'history';
import * as queryString from 'query-string';
import * as _ from 'lodash';

type LocationParams = {[key: string]: string};

class Location {
    @observable path: string = '/';
    @observable params: LocationParams = {};

    private history = createBrowserHistory();

    constructor() {
        this.history.listen(e => this.accept(e.location));
        this.accept(window.location);
    }

    @action.bound
    accept({pathname, hash}) {
        this.path =  pathname;
    }

}

export const theLocation = new Location();
