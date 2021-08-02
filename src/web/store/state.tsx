import {autorun, observable} from 'mobx';
import { CameraDef, CamListResponse } from '../../common/models';

class AppState {
    @observable cams: CameraDef[] = [];
    @observable expandedNav = false;

    toggleNav() {
        this.expandedNav = !this.expandedNav
    }
}

autorun(()=>{
    fetch('/api/list/')
    .then(res => res.json())
    .then((res: CamListResponse) => {
        theAppState.cams = res.items;
    })
})

export const theAppState = new AppState();
