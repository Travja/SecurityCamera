import React, { lazy, Suspense, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ErrorBoundary from "./components/code-spliting/errorBoundary";
import { fallback } from "./components/code-spliting/fallback-ui";
import Drawer from "./components/Drawer";

const Home = lazy(() => import("./components/pages/home"));
const Feeds = lazy(() => import("./components/pages/feeds"));

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <Suspense {...fallback}>
                    <Drawer />
                    <div style={{marginLeft: "100px"}}>
                        <Switch>
                            <Route exact path="/" component={Home} />
                            <Route exact path="/feeds" component={Feeds} />
                            {/* ... */}
                        </Switch>
                    </div>
                </Suspense>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
