import { observable, autorun } from "mobx";
import { ListResponse } from "../../common/models";
import { theLocation } from "./location";

class PathItemsStore {
    @observable currentPath;
    @observable subItems;
}

export const thePathItemsStore = new PathItemsStore();

autorun(() => {
    const absLoc = theLocation.path.split('/').slice(2, -1); // strip /view/ and /$
    fetch(`/api/list/${absLoc.join('/')}/`)
    .then(r => r.json() as Promise<ListResponse>)
    .then(res => {
        thePathItemsStore.currentPath = absLoc;
        thePathItemsStore.subItems = res.items.map(v => v.name)
    });
});
