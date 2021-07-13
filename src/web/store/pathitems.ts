import _ = require("lodash");
import { observable, autorun, runInAction } from "mobx";
import { ListItem, ListResponse } from "../../common/models";
import { CtxGuard } from "../../server/utils";
import { urljoin } from "../utils/urljoin";
import { theLocation } from "./location";

class PathItemsStore {
    @observable currentPath: string[] = [];
    @observable subItems: string[] = [];
}

export const thePathItemsStore = new PathItemsStore();

autorun(async () => {
    const absLoc = theLocation.path.split('/').slice(2, -1); // strip /view/ and /$
    runInAction(()=>{
        thePathItemsStore.currentPath = absLoc;
        thePathItemsStore.subItems = []
    })
    const samePathGuard = new CtxGuard(() => theLocation.path)

    // only request subitems if not displaying a file
    if (!/[.]/.test(_.last(absLoc))) {
        fetch(urljoin('/api/list/', ...absLoc, '/'))
        .then(r => r.json() as Promise<ListResponse>)
        .then(res => {
            runInAction(()=>{
                if (samePathGuard.unchanged()) {
                    thePathItemsStore.subItems = _.map(res.items, v => v.name)
                }
            })
        });
    }
});
