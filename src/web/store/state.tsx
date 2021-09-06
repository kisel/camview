import {autorun, observable} from 'mobx';
import { CamMetadataDict, CamMetadataResponse } from '../../common/models';

class AppState {
    @observable expandedNav = false;
    @observable camMeta: CamMetadataDict = {};

    toggleNav() {
        this.expandedNav = !this.expandedNav
    }
}

autorun(() => {
    fetch('/api/camera/metadata')
        .then(res => res.json())
        .then((res: CamMetadataResponse) => {
            theAppState.camMeta = res.camera_metadata || {};
        })
})

export const theAppState = new AppState();
