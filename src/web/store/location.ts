import {observable, action} from 'mobx';
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

    change(path: string, params?: LocationParams) {
        if (path === this.path && _.isEqual(params, this.params)) {
            return;
        }
        let targetPath = '/';
        if (targetPath.endsWith('/')) {
            targetPath = targetPath.substr(0, targetPath.length-1);
        }
        targetPath += path;
        if (!_.isEmpty(params)) {
            targetPath += '#' + queryString.stringify(params);
        }
        this.history.push(targetPath);
    }
}

export const theLocation = new Location();
