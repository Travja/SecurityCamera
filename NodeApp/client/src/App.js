import React, { lazy, Suspense, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ErrorBoundary from "./components/code-spliting/errorBoundary";
import { fallback } from "./components/code-spliting/fallback-ui";
import axios from "axios";

import "./styles/Page.css";
import "./styles/Drawer.css";
import "./styles/VideoCard.css";
import Drawer from "./components/Drawer";
import Login from "./components/pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";

const Home = lazy(() => import("./components/pages/Home"));
const Streams = lazy(() => import("./components/pages/Streams"));
const Recordings = lazy(() => import("./components/pages/Recordings"));
const Settings = lazy(() => import("./components/pages/Settings"));

function App() {
  axios.defaults.baseURL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : "";
  return (
    <ErrorBoundary>
      <Router>
        <Suspense {...fallback}>
          <Drawer />
          <div style={{ marginLeft: "100px" }}>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/login" component={Login} />
              <ProtectedRoute exact path="/streams" component={Streams} />
              <ProtectedRoute exact path="/recordings" component={Recordings} />
              <ProtectedRoute exact path="/settings" component={Settings} />
            </Switch>
          </div>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
