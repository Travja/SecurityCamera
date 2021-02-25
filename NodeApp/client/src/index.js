import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./App";
import ErrorBoundary from "./components/code-spliting/errorBoundary";
import store from "./store";

ReactDOM.render(
    <React.Fragment>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
    </React.Fragment>,
    document.getElementById("root")
);
