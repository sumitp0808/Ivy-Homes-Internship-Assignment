import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

import { getStoredSession } from "./services/api";

function Root() {
    const [session, setSession] = React.useState(
        getStoredSession()
    );

    return (
        <App
            session={session}
            setSession={setSession}
        />
    );
}

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <BrowserRouter>
            <Root />
        </BrowserRouter>
    </React.StrictMode>
);