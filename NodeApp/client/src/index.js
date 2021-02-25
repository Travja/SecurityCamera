import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./App";
import ErrorBoundary from "./components/code-spliting/errorBoundary";
// Redux
import { createStore } from "redux";
import { Provider } from "react-redux";
import { reducer } from "./redux/redux-reducer";
const store = createStore(reducer);

ReactDOM.render(
  <Provider store={store}>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </Provider>,
  document.getElementById("root")
);
