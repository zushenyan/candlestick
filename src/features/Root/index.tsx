import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import KlinePage from '../KlinePage';
import WidgetPage from '../WidgetPage';

const Root: React.FC<unknown> = () => {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/kline">kline</Link>
          </li>
          <li>
            <Link to="/widget">widget</Link>
          </li>
        </ul>
      </div>

      <Switch>
        <Route path="/kline">
          <KlinePage />
        </Route>
        <Route path="/widget">
          <WidgetPage />
        </Route>
      </Switch>
    </Router>
  );
};

export default Root;
