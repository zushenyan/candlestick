import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import CandlestickChartPage from '../CandlestickChartPage';
import WidgetPage from '../WidgetPage';

const Root: React.FC<unknown> = () => {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/candlestick_chart">candlestick chart</Link>
          </li>
          <li>
            <Link to="/widget">widget</Link>
          </li>
        </ul>
      </div>

      <Switch>
        <Route path="/candlestick_chart">
          <CandlestickChartPage />
        </Route>
        <Route path="/widget">
          <WidgetPage />
        </Route>
      </Switch>
    </Router>
  );
};

export default Root;
