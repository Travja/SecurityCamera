import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./App";
import ErrorBoundary from "./components/code-spliting/errorBoundary";

ReactDOM.render(
  <React.Fragment>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.Fragment>,
  document.getElementById("root")
);
