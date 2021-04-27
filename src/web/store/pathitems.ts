import _ = require("lodash");
import { observable, autorun, runInAction } from "mobx";
import { ListItem, ListResponse } from "../../common/models";
import { urljoin } from "../utils/urljoin";
import { theLocation } from "./location";

class PathItemsStore {
    @observable currentPath: string[] = [];
    @observable subItems: string[] = [];
}

export const thePathItemsStore = new PathItemsStore();

autorun(() => {
    const absLoc = theLocation.path.split('/').slice(2, -1); // strip /view/ and /$
    fetch(urljoin('/api/list/', ...absLoc, '/'))
    .then(r => r.json() as Promise<ListResponse>)
    .then(res => {
        runInAction(()=>{
            thePathItemsStore.currentPath = absLoc;
            thePathItemsStore.subItems = _.map(res.items, v => v.name)
        })
    });
});
