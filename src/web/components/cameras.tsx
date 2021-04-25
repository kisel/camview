import React = require("react");
import { observer, useObserver } from "mobx-react-lite";
import {Card, Button, Container, Col, Row} from "react-bootstrap"
import { theAppState } from "../../state";
import _ = require("lodash");
import { ListResponse } from "../../common/models";
import { autorun, observable } from "mobx";
import { theLocation } from "../location";


class PathItemsStore {
    @observable currentPath;
    @observable subItems;
}

const thePathItemsStore = new PathItemsStore();

// import {
//     useParams
// } from "react-router-dom";
autorun(() => {
    const absLoc = theLocation.path.split('/').slice(2, -1); // strip /view/ and /$
    fetch(`/api/list/${absLoc.join('/')}/`)
    .then(r => r.json() as Promise<ListResponse>)
    .then(res => {
        thePathItemsStore.currentPath = absLoc;
        thePathItemsStore.subItems = res.items.map(v => v.name)
    });
});

export const CameraList = observer(() => {
    return (
        <Container>
            <div className="row align-items-stretch justify-content-start card-deck">

            {_.map(theAppState.cams, k => (
                // <Card key={k.name} style={{ width: '18rem' }}>
                //     <Card.Img variant="top" src={`/api/thumbnail/${k.name}`} />
                //     <Card.Body>
                //         <Card.Title>Card Title</Card.Title>
                //         <Card.Text>
                //             Some quick example text to build on the card title and make up the bulk of
                //             the card's content.
                //         </Card.Text>
                //     </Card.Body>
                // </Card>
                <div className="card" key={k.name}>
                    <img className="card-img-top" src={`/api/thumbnail/${k.name}`} alt={k.name} />
                    <div className="card-body">
                        <p className="card-text">{k.name}</p>
                    </div>
                    {/* <div className="card-img-overlay">
                        <p className="card-text">Last updated 3 mins ago</p>
                    </div> */}
                </div>
            ))}
            </div>
        </Container>
    );
});


export const CameraTimeline = observer(() => {
    return (
        <Container>
            {/* <div className="row align-items-stretch justify-content-start card-deck"> */}
<Row>
            {_.map(thePathItemsStore.subItems, k => (
                // <Card key={k.name} style={{ width: '18rem' }}>
                //     <Card.Img variant="top" src={`/api/thumbnail/${k.name}`} />
                //     <Card.Body>
                //         <Card.Title>Card Title</Card.Title>
                //         <Card.Text>
                //             Some quick example text to build on the card title and make up the bulk of
                //             the card's content.
                //         </Card.Text>
                //     </Card.Body>
                // </Card>
                <div className="col-4">
                <div className="card" key={k}>
                    <img className="card-img-top" src={`/api/thumbnail/${thePathItemsStore.currentPath.join('/')}/${k}`} />
                    <div className="card-body">
                        <p className="card-text">{k}</p>
                    </div>
                    {/* <div className="card-img-overlay">
                        <p className="card-text">Last updated 3 mins ago</p>
                    </div> */}
                </div></div>
            ))}
</Row>
            {/* </div> */}
        </Container>
    );
});


