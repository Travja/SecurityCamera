import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ErrorBoundary from "./components/code-spliting/errorBoundary";
import { fallback } from "./components/code-spliting/fallback-ui";

const Home = lazy(() => import("./components/pages/home"));
const Feeds = lazy(() => import("./components/pages/feeds"));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense {...fallback}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/feeds" component={Feeds} />
            {/* ... */}
          </Switch>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
