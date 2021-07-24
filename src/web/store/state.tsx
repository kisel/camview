import {autorun, observable} from 'mobx';
import { CameraDef, CamListResponse } from '../../common/models';

class AppState {
    @observable cams: CameraDef[] = [];
}

autorun(()=>{
    fetch('/api/camera/')
    .then(res => res.json())
    .then((res: CamListResponse) => {
        theAppState.cams = res.items;
    })
})

export const theAppState = new AppState();
