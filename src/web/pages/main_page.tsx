import React = require("react");
import { observer } from "mobx-react-lite";

export const MainPage = observer(() => {
    return (
        <div>
            You should be automatically redirected to <a href="/view/">/view/</a>
        </div>
    );
});
